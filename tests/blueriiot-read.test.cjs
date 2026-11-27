const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

function card() {
  const elements = new Map();
  const customElements = { define: (name, cls) => elements.set(name, cls) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../main.js'), 'utf8'), {
    HTMLElement: class {}, customElements, console: { info() {} },
    window: { customElements, setTimeout() { assert.fail('Measurement must not use a timer'); } },
  });
  const instance = new (elements.get('pc-pool-controller-card'))();
  instance._render = () => {
    instance.active = instance._applyOptimisticActions({}).blueriiotReadPending;
  };
  return instance;
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

for (const viaButton of [true, false]) {
  test(`active until backend completes via ${viaButton ? 'button' : 'service'}`, async () => {
    const instance = card();
    const measurement = deferred();
    const calls = [];
    instance._hass = { callService: (...args) => { calls.push(args); return measurement.promise; } };
    instance._hasService = () => true;
    instance._buildTargetObject = () => ({ climate_entity: 'climate.pool' });
    const config = viaButton ? { blueriiot_read_button: 'button.pool_read' } : {};
    const request = instance._readBlueRiiot(config);
    assert.equal(instance.active, true);
    await Promise.resolve();
    // Advancing time past the former 15-second timeout cannot clear the state.
    const realNow = Date.now;
    try {
      Date.now = () => realNow() + 60000;
      instance._optimisticActions = new Map();
      instance._render();
      assert.equal(instance.active, true);
    } finally {
      Date.now = realNow;
    }
    await instance._readBlueRiiot(config);
    assert.equal(calls.length, 1, 'Repeated clicks must not start a second measurement');
    assert.deepEqual(calls[0].slice(0, 2), viaButton ? ['button', 'press'] : ['pool_controller', 'read_blueriiot']);
    measurement.resolve();
    await request;
    assert.equal(instance.active, false);
  });
}

for (const sync of [false, true]) {
  test(`failure clears active state and allows retry (${sync ? 'synchronous' : 'asynchronous'})`, async () => {
    const instance = card();
    const measurement = deferred();
    instance._hass = { callService() {
      if (sync) throw new Error('Service unavailable');
      return measurement.promise;
    } };
    const request = instance._readBlueRiiot({ blueriiot_read_button: 'button.pool_read' });
    if (!sync) {
      assert.equal(instance.active, true);
      measurement.reject(new Error('Measurement failed'));
    }
    await request;
    assert.equal(instance.active, false);
    instance._hass.callService = () => Promise.resolve();
    await instance._readBlueRiiot({ blueriiot_read_button: 'button.pool_read' });
    assert.equal(instance.active, false);
  });
}

test('missing service leaves no active state', async () => {
  const instance = card();
  instance._hasService = () => false;
  await instance._readBlueRiiot({});
  assert.equal(instance.active, false);
});
