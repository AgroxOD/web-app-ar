process.env.NODE_ENV = 'test';

import { describe, it, expect } from 'vitest';
import { Model } from '../server.js';

describe('Model schema', () => {
  it('includes markerIndex field', () => {
    expect(Model.schema.obj).toHaveProperty('markerIndex');
  });
});
