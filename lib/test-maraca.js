/* Copyright (C) 2018 Canonical Ltd. */
'use strict';

const clonedeep = require('lodash.clonedeep');
const sinon = require('sinon');
const t = require('tap');

const Maraca = require('./maraca');
const parsers = require('./parsers');

t.mochaGlobals();

describe('Maraca', () => {
  let maraca, onChange;

  beforeEach(() => {
    onChange = sinon.stub();
    maraca = new Maraca({
      onChange: onChange
    });
  });

  it('inits correctly', () => {
    t.equal(maraca.ON_CHANGE, onChange);
  });

  it('adds entities', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'unit', 'change', {
              name: 'apache2/0'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().units, {
      'apache2/0': parsers.parseUnit({
        name: 'apache2/0'
      })
    });
  });

  it('updates entities', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'unit', 'change', {
              name: 'apache2/0',
              series: 'trusty'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().units, {
      'apache2/0': parsers.parseUnit({
        name: 'apache2/0',
        series: 'trusty'
      })
    });
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'unit', 'change', {
              name: 'apache2/0',
              series: 'wily'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().units, {
      'apache2/0': parsers.parseUnit({
        name: 'apache2/0',
        series: 'wily'
      })
    });
  });

  it('removes entities', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'unit', 'change', {
              name: 'apache2/0'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().units, {
      'apache2/0': parsers.parseUnit({
        name: 'apache2/0'
      })
    });
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'unit', 'remove', {
              name: 'apache2/0'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().units, {});
  });

  it('can handle remote applications', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'remote-application', 'change', {
              name: 'apache2'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().remoteApplications, {
      apache2: parsers.parseRemoteApplication({
        name: 'apache2'
      })
    });
  });

  it('can handle applications', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'application', 'change', {
              name: 'apache2'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().applications, {
      apache2: parsers.parseApplication({
        name: 'apache2'
      })
    });
  });

  it('can handle units', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'unit', 'change', {
              name: 'apache2/0'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().units, {
      'apache2/0': parsers.parseUnit({
        name: 'apache2/0'
      })
    });
  });

  it('can handle machines', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'machine', 'change', {
              id: '0'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().machines, {
      0: parsers.parseMachine({
        id: '0'
      })
    });
  });

  it('can handle relations', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'relation', 'change', {
              id: '1'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().relations, {
      1: parsers.parseRelation({
        id: '1'
      })
    });
  });

  it('can handle annotations', () => {
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'annotation', 'change', {
              tag: 'application-apache2'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore().annotations, {
      'application-apache2': parsers.parseAnnotation({
        tag: 'application-apache2'
      })
    });
  });

  it('can handle unkown entities', () => {
    // Get a clone of the empty object shape.
    const empty = clonedeep(maraca.getValueStore());
    maraca._watcherListener({
      detail: {
        response: {
          deltas: [[
            'nothing-here', 'change', {
              id: '1'
            }
          ]]
        }
      }
    });
    t.deepEqual(maraca.getValueStore(), empty);
  });
});
