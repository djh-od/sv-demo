var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity)
      fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy)
      fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous")
      fetchOpts.credentials = "omit";
    else
      fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
function run_all(arr) {
  for (var i = 0; i < arr.length; i++) {
    arr[i]();
  }
}
function run(fn) {
  return fn();
}
var is_array = Array.isArray;
var array_from = Array.from;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
function default_equals(a, b) {
  return a === b;
}
const SOURCE = 1;
const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const PRE_EFFECT = 1 << 3;
const RENDER_EFFECT = 1 << 4;
const MANAGED = 1 << 6;
const UNOWNED = 1 << 7;
const CLEAN = 1 << 8;
const DIRTY = 1 << 9;
const MAYBE_DIRTY = 1 << 10;
const INERT = 1 << 11;
const DESTROYED = 1 << 12;
const ROOT_BLOCK = 0;
const IF_BLOCK = 1;
const EACH_BLOCK = 2;
const UNINITIALIZED = Symbol();
function create_computation_signal(flags, value, block) {
  const signal = {
    b: block,
    c: null,
    d: null,
    e: null,
    f: flags,
    l: 0,
    i: null,
    r: null,
    v: value,
    w: 0,
    x: null,
    y: null
  };
  return signal;
}
function push_reference(target_signal, ref_signal) {
  const references = target_signal.r;
  if (references === null) {
    target_signal.r = [ref_signal];
  } else {
    references.push(ref_signal);
  }
}
function internal_create_effect(type, fn, sync, block, schedule) {
  const signal = create_computation_signal(type | DIRTY, null, block);
  signal.i = fn;
  signal.x = current_component_context;
  if (current_effect !== null) {
    signal.l = current_effect.l + 1;
    if ((type & MANAGED) === 0) {
      push_reference(current_effect, signal);
    }
  }
  if (schedule) {
    schedule_effect(signal, sync);
  }
  return signal;
}
function user_effect(fn) {
  var _a;
  if (current_effect === null) {
    throw new Error(
      "ERR_SVELTE_ORPHAN_EFFECT"
    );
  }
  const apply_component_effect_heuristics = current_effect.f & RENDER_EFFECT && current_component_context !== null && !current_component_context.m;
  const effect = internal_create_effect(
    EFFECT,
    fn,
    false,
    current_block,
    !apply_component_effect_heuristics
  );
  if (apply_component_effect_heuristics) {
    const context = (
      /** @type {import('../types.js').ComponentContext} */
      current_component_context
    );
    ((_a = context.e) != null ? _a : context.e = []).push(effect);
  }
  return effect;
}
function pre_effect(fn) {
  if (current_effect === null) {
    throw new Error(
      "ERR_SVELTE_ORPHAN_EFFECT"
    );
  }
  const sync = current_effect !== null && (current_effect.f & RENDER_EFFECT) !== 0;
  return internal_create_effect(
    PRE_EFFECT,
    () => {
      const val = fn();
      flush_local_render_effects();
      return val;
    },
    sync,
    current_block,
    true
  );
}
function render_effect(fn, block = current_block, managed = false, sync = true) {
  let flags = RENDER_EFFECT;
  if (managed) {
    flags |= MANAGED;
  }
  return internal_create_effect(
    flags,
    /** @type {any} */
    fn,
    sync,
    block,
    true
  );
}
// @__NO_SIDE_EFFECTS__
function source(initial_value) {
  return create_source_signal(SOURCE | CLEAN, initial_value);
}
function create_source_signal(flags, value) {
  return {
    // consumers
    c: null,
    // equals
    e: default_equals,
    // flags
    f: flags,
    // value
    v: value,
    // write version
    w: 0
  };
}
function flush_tasks() {
}
const IS_EFFECT = EFFECT | PRE_EFFECT | RENDER_EFFECT;
const FLUSH_MICROTASK = 0;
const FLUSH_SYNC = 1;
let current_scheduler_mode = FLUSH_MICROTASK;
let is_micro_task_queued = false;
let is_flushing_effect = false;
let current_queued_pre_and_render_effects = [];
let current_queued_effects = [];
let flush_count = 0;
let current_consumer = null;
let current_effect = null;
let current_dependencies = null;
let current_dependencies_index = 0;
let current_untracked_writes = null;
let current_untracking = false;
let ignore_mutation_validation = false;
let current_skip_consumer = false;
let current_block = null;
let current_component_context = null;
function is_runes(context) {
  const component_context = context || current_component_context;
  return component_context !== null && component_context.r;
}
function is_signal_dirty(signal) {
  const flags = signal.f;
  if ((flags & DIRTY) !== 0 || signal.v === UNINITIALIZED) {
    return true;
  }
  if ((flags & MAYBE_DIRTY) !== 0) {
    const dependencies = (
      /** @type {import('./types.js').ComputationSignal<V>} **/
      signal.d
    );
    if (dependencies !== null) {
      const length = dependencies.length;
      let i;
      for (i = 0; i < length; i++) {
        const dependency = dependencies[i];
        if ((dependency.f & MAYBE_DIRTY) !== 0 && !is_signal_dirty(dependency)) {
          set_signal_status(dependency, CLEAN);
          continue;
        }
        if ((dependency.f & DIRTY) !== 0) {
          if ((dependency.f & DERIVED) !== 0) {
            update_derived(
              /** @type {import('./types.js').ComputationSignal<V>} **/
              dependency,
              true
            );
            if ((signal.f & DIRTY) !== 0) {
              return true;
            }
          } else {
            return true;
          }
        }
        const is_unowned = (flags & UNOWNED) !== 0;
        const write_version = signal.w;
        const dep_write_version = dependency.w;
        if (is_unowned && dep_write_version > write_version) {
          signal.w = dep_write_version;
          return true;
        }
      }
    }
  }
  return false;
}
function execute_signal_fn(signal) {
  const init2 = signal.i;
  const flags = signal.f;
  const previous_dependencies = current_dependencies;
  const previous_dependencies_index = current_dependencies_index;
  const previous_untracked_writes = current_untracked_writes;
  const previous_consumer = current_consumer;
  const previous_block = current_block;
  const previous_component_context = current_component_context;
  const previous_skip_consumer = current_skip_consumer;
  const is_render_effect = (flags & RENDER_EFFECT) !== 0;
  const previous_untracking = current_untracking;
  current_dependencies = /** @type {null | import('./types.js').Signal[]} */
  null;
  current_dependencies_index = 0;
  current_untracked_writes = null;
  current_consumer = signal;
  current_block = signal.b;
  current_component_context = signal.x;
  current_skip_consumer = !is_flushing_effect && (flags & UNOWNED) !== 0;
  current_untracking = false;
  try {
    let res;
    if (is_render_effect) {
      res = /** @type {(block: import('./types.js').Block, signal: import('./types.js').Signal) => V} */
      init2(
        /** @type {import('./types.js').Block} */
        signal.b,
        /** @type {import('./types.js').Signal} */
        signal
      );
    } else {
      res = /** @type {() => V} */
      init2();
    }
    let dependencies = (
      /** @type {import('./types.js').Signal<unknown>[]} **/
      signal.d
    );
    if (current_dependencies !== null) {
      let i;
      if (dependencies !== null) {
        const deps_length = dependencies.length;
        const full_current_dependencies = current_dependencies_index === 0 ? current_dependencies : dependencies.slice(0, current_dependencies_index).concat(current_dependencies);
        const current_dep_length = full_current_dependencies.length;
        const full_current_dependencies_set = current_dep_length > 16 && deps_length - current_dependencies_index > 1 ? new Set(full_current_dependencies) : null;
        for (i = current_dependencies_index; i < deps_length; i++) {
          const dependency = dependencies[i];
          if (full_current_dependencies_set !== null ? !full_current_dependencies_set.has(dependency) : !full_current_dependencies.includes(dependency)) {
            remove_consumer(signal, dependency);
          }
        }
      }
      if (dependencies !== null && current_dependencies_index > 0) {
        dependencies.length = current_dependencies_index + current_dependencies.length;
        for (i = 0; i < current_dependencies.length; i++) {
          dependencies[current_dependencies_index + i] = current_dependencies[i];
        }
      } else {
        signal.d = /** @type {import('./types.js').Signal<V>[]} **/
        dependencies = current_dependencies;
      }
      if (!current_skip_consumer) {
        for (i = current_dependencies_index; i < dependencies.length; i++) {
          const dependency = dependencies[i];
          const consumers = dependency.c;
          if (consumers === null) {
            dependency.c = [signal];
          } else if (consumers[consumers.length - 1] !== signal) {
            consumers.push(signal);
          }
        }
      }
    } else if (dependencies !== null && current_dependencies_index < dependencies.length) {
      remove_consumers(signal, current_dependencies_index);
      dependencies.length = current_dependencies_index;
    }
    return res;
  } finally {
    current_dependencies = previous_dependencies;
    current_dependencies_index = previous_dependencies_index;
    current_untracked_writes = previous_untracked_writes;
    current_consumer = previous_consumer;
    current_block = previous_block;
    current_component_context = previous_component_context;
    current_skip_consumer = previous_skip_consumer;
    current_untracking = previous_untracking;
  }
}
function remove_consumer(signal, dependency) {
  const consumers = dependency.c;
  let consumers_length = 0;
  if (consumers !== null) {
    consumers_length = consumers.length - 1;
    const index = consumers.indexOf(signal);
    if (index !== -1) {
      if (consumers_length === 0) {
        dependency.c = null;
      } else {
        consumers[index] = consumers[consumers_length];
        consumers.pop();
      }
    }
  }
  if (consumers_length === 0 && (dependency.f & UNOWNED) !== 0) {
    set_signal_status(dependency, DIRTY);
    remove_consumers(
      /** @type {import('./types.js').ComputationSignal<V>} **/
      dependency,
      0
    );
  }
}
function remove_consumers(signal, start_index) {
  const dependencies = signal.d;
  if (dependencies !== null) {
    const active_dependencies = start_index === 0 ? null : dependencies.slice(0, start_index);
    let i;
    for (i = start_index; i < dependencies.length; i++) {
      const dependency = dependencies[i];
      if (active_dependencies === null || !active_dependencies.includes(dependency)) {
        remove_consumer(signal, dependency);
      }
    }
  }
}
function destroy_references(signal) {
  const references = signal.r;
  signal.r = null;
  if (references !== null) {
    let i;
    for (i = 0; i < references.length; i++) {
      destroy_signal(references[i]);
    }
  }
}
function report_error(block, error) {
  let current_block2 = block;
  if (current_block2 !== null) {
    throw error;
  }
}
function execute_effect(signal) {
  if ((signal.f & DESTROYED) !== 0) {
    return;
  }
  const teardown = signal.v;
  const previous_effect = current_effect;
  current_effect = signal;
  try {
    destroy_references(signal);
    if (teardown !== null) {
      teardown();
    }
    const possible_teardown = execute_signal_fn(signal);
    if (typeof possible_teardown === "function") {
      signal.v = possible_teardown;
    }
  } catch (error) {
    const block = signal.b;
    if (block !== null) {
      report_error(block, error);
    } else {
      throw error;
    }
  } finally {
    current_effect = previous_effect;
  }
  const component_context = signal.x;
  if (is_runes(component_context) && // Don't rerun pre effects more than once to accomodate for "$: only runs once" behavior
  (signal.f & PRE_EFFECT) !== 0 && current_queued_pre_and_render_effects.length > 0) {
    flush_local_pre_effects(component_context);
  }
}
function infinite_loop_guard() {
  if (flush_count > 100) {
    flush_count = 0;
    throw new Error(
      "ERR_SVELTE_TOO_MANY_UPDATES"
    );
  }
  flush_count++;
}
function flush_queued_effects(effects) {
  const length = effects.length;
  if (length > 0) {
    infinite_loop_guard();
    const previously_flushing_effect = is_flushing_effect;
    is_flushing_effect = true;
    try {
      let i;
      for (i = 0; i < length; i++) {
        const signal = effects[i];
        const flags = signal.f;
        if ((flags & (DESTROYED | INERT)) === 0) {
          if (is_signal_dirty(signal)) {
            set_signal_status(signal, CLEAN);
            execute_effect(signal);
          } else if ((flags & MAYBE_DIRTY) !== 0) {
            set_signal_status(signal, CLEAN);
          }
        }
      }
    } finally {
      is_flushing_effect = previously_flushing_effect;
    }
    effects.length = 0;
  }
}
function process_microtask() {
  is_micro_task_queued = false;
  if (flush_count > 101) {
    return;
  }
  const previous_queued_pre_and_render_effects = current_queued_pre_and_render_effects;
  const previous_queued_effects = current_queued_effects;
  current_queued_pre_and_render_effects = [];
  current_queued_effects = [];
  flush_queued_effects(previous_queued_pre_and_render_effects);
  flush_queued_effects(previous_queued_effects);
  if (!is_micro_task_queued) {
    flush_count = 0;
  }
}
function schedule_effect(signal, sync) {
  const flags = signal.f;
  if (sync) {
    const previously_flushing_effect = is_flushing_effect;
    try {
      is_flushing_effect = true;
      execute_effect(signal);
      set_signal_status(signal, CLEAN);
    } finally {
      is_flushing_effect = previously_flushing_effect;
    }
  } else {
    if (current_scheduler_mode === FLUSH_MICROTASK) {
      if (!is_micro_task_queued) {
        is_micro_task_queued = true;
        queueMicrotask(process_microtask);
      }
    }
    if ((flags & EFFECT) !== 0) {
      current_queued_effects.push(signal);
      if ((flags & MANAGED) === 0) {
        mark_subtree_children_inert(signal, true);
      }
    } else {
      const length = current_queued_pre_and_render_effects.length;
      let should_append = length === 0;
      if (!should_append) {
        const target_level = signal.l;
        const target_block = signal.b;
        const is_pre_effect = (flags & PRE_EFFECT) !== 0;
        let target_signal;
        let is_target_pre_effect;
        let i = length;
        while (true) {
          target_signal = current_queued_pre_and_render_effects[--i];
          if (target_signal.l <= target_level) {
            if (i + 1 === length) {
              should_append = true;
            } else {
              is_target_pre_effect = (target_signal.f & PRE_EFFECT) !== 0;
              if (target_signal.b !== target_block || is_target_pre_effect && !is_pre_effect) {
                i++;
              }
              current_queued_pre_and_render_effects.splice(i, 0, signal);
            }
            break;
          }
          if (i === 0) {
            current_queued_pre_and_render_effects.unshift(signal);
            break;
          }
        }
      }
      if (should_append) {
        current_queued_pre_and_render_effects.push(signal);
      }
    }
  }
}
function flush_local_render_effects() {
  const effects = [];
  for (let i = 0; i < current_queued_pre_and_render_effects.length; i++) {
    const effect = current_queued_pre_and_render_effects[i];
    if ((effect.f & RENDER_EFFECT) !== 0 && effect.x === current_component_context) {
      effects.push(effect);
      current_queued_pre_and_render_effects.splice(i, 1);
      i--;
    }
  }
  flush_queued_effects(effects);
}
function flush_local_pre_effects(context) {
  const effects = [];
  for (let i = 0; i < current_queued_pre_and_render_effects.length; i++) {
    const effect = current_queued_pre_and_render_effects[i];
    if ((effect.f & PRE_EFFECT) !== 0 && effect.x === context) {
      effects.push(effect);
      current_queued_pre_and_render_effects.splice(i, 1);
      i--;
    }
  }
  flush_queued_effects(effects);
}
function flushSync(fn) {
  flush_sync(fn);
}
function flush_sync(fn, flush_previous = true) {
  const previous_scheduler_mode = current_scheduler_mode;
  const previous_queued_pre_and_render_effects = current_queued_pre_and_render_effects;
  const previous_queued_effects = current_queued_effects;
  let result;
  try {
    infinite_loop_guard();
    const pre_and_render_effects = [];
    const effects = [];
    current_scheduler_mode = FLUSH_SYNC;
    current_queued_pre_and_render_effects = pre_and_render_effects;
    current_queued_effects = effects;
    if (flush_previous) {
      flush_queued_effects(previous_queued_pre_and_render_effects);
      flush_queued_effects(previous_queued_effects);
    }
    if (fn !== void 0) {
      result = fn();
    }
    if (current_queued_pre_and_render_effects.length > 0 || effects.length > 0) {
      flushSync();
    }
    flush_tasks();
    flush_count = 0;
  } finally {
    current_scheduler_mode = previous_scheduler_mode;
    current_queued_pre_and_render_effects = previous_queued_pre_and_render_effects;
    current_queued_effects = previous_queued_effects;
  }
  return result;
}
function update_derived(signal, force_schedule) {
  destroy_references(signal);
  const value = execute_signal_fn(signal);
  const status = (current_skip_consumer || (signal.f & UNOWNED) !== 0) && signal.d !== null ? MAYBE_DIRTY : CLEAN;
  set_signal_status(signal, status);
  const equals = (
    /** @type {import('./types.js').EqualsFunctions} */
    signal.e
  );
  if (!equals(value, signal.v)) {
    signal.v = value;
    mark_signal_consumers(signal, DIRTY, force_schedule);
  }
}
function get(signal) {
  const flags = signal.f;
  if ((flags & DESTROYED) !== 0) {
    return signal.v;
  }
  if (current_consumer !== null && (current_consumer.f & MANAGED) === 0 && !current_untracking) {
    const unowned = (current_consumer.f & UNOWNED) !== 0;
    const dependencies = current_consumer.d;
    if (current_dependencies === null && dependencies !== null && dependencies[current_dependencies_index] === signal && !(unowned && current_effect !== null)) {
      current_dependencies_index++;
    } else if (dependencies === null || current_dependencies_index === 0 || dependencies[current_dependencies_index - 1] !== signal) {
      if (current_dependencies === null) {
        current_dependencies = [signal];
      } else {
        current_dependencies.push(signal);
      }
    }
    if (current_untracked_writes !== null && current_effect !== null && (current_effect.f & CLEAN) !== 0 && (current_effect.f & MANAGED) === 0 && current_untracked_writes.includes(signal)) {
      set_signal_status(current_effect, DIRTY);
      schedule_effect(current_effect, false);
    }
  }
  if ((flags & DERIVED) !== 0 && is_signal_dirty(signal)) {
    {
      update_derived(
        /** @type {import('./types.js').ComputationSignal<V>} **/
        signal,
        false
      );
    }
  }
  return signal.v;
}
function set(signal, value) {
  set_signal_value(signal, value);
  return value;
}
function mark_subtree_children_inert(signal, inert, visited_blocks) {
  const references = signal.r;
  if (references !== null) {
    let i;
    for (i = 0; i < references.length; i++) {
      const reference = references[i];
      if ((reference.f & IS_EFFECT) !== 0) {
        mark_subtree_inert(reference, inert, visited_blocks);
      }
    }
  }
}
function mark_subtree_inert(signal, inert, visited_blocks = /* @__PURE__ */ new Set()) {
  const flags = signal.f;
  const is_already_inert = (flags & INERT) !== 0;
  if (is_already_inert !== inert) {
    signal.f ^= INERT;
    if (!inert && (flags & IS_EFFECT) !== 0 && (flags & CLEAN) === 0) {
      schedule_effect(
        /** @type {import('./types.js').EffectSignal} */
        signal,
        false
      );
    }
    const block = signal.b;
    if (block !== null && !visited_blocks.has(block)) {
      visited_blocks.add(block);
      const type = block.t;
      if (type === IF_BLOCK) {
        const condition_effect = block.e;
        if (condition_effect !== null && block !== current_block) {
          mark_subtree_inert(condition_effect, inert, visited_blocks);
        }
        const consequent_effect = block.ce;
        if (consequent_effect !== null && block.v) {
          mark_subtree_inert(consequent_effect, inert, visited_blocks);
        }
        const alternate_effect = block.ae;
        if (alternate_effect !== null && !block.v) {
          mark_subtree_inert(alternate_effect, inert, visited_blocks);
        }
      } else if (type === EACH_BLOCK) {
        const items = block.v;
        for (let { e: each_item_effect } of items) {
          if (each_item_effect !== null) {
            mark_subtree_inert(each_item_effect, inert, visited_blocks);
          }
        }
      }
    }
  }
  mark_subtree_children_inert(signal, inert, visited_blocks);
}
function mark_signal_consumers(signal, to_status, force_schedule) {
  const runes = is_runes(null);
  const consumers = signal.c;
  if (consumers !== null) {
    const length = consumers.length;
    let i;
    for (i = 0; i < length; i++) {
      const consumer = consumers[i];
      const flags = consumer.f;
      const unowned = (flags & UNOWNED) !== 0;
      if ((!force_schedule || !runes) && consumer === current_effect) {
        continue;
      }
      set_signal_status(consumer, to_status);
      const maybe_dirty = (flags & MAYBE_DIRTY) !== 0;
      if ((flags & CLEAN) !== 0 || maybe_dirty && unowned) {
        if ((consumer.f & IS_EFFECT) !== 0) {
          schedule_effect(
            /** @type {import('./types.js').EffectSignal} */
            consumer,
            false
          );
        } else {
          mark_signal_consumers(consumer, MAYBE_DIRTY, force_schedule);
        }
      }
    }
  }
}
function set_signal_value(signal, value) {
  if (!current_untracking && !ignore_mutation_validation && current_consumer !== null && is_runes(null) && (current_consumer.f & DERIVED) !== 0) {
    throw new Error(
      "ERR_SVELTE_UNSAFE_MUTATION"
    );
  }
  if ((signal.f & SOURCE) !== 0 && !/** @type {import('./types.js').EqualsFunctions} */
  signal.e(value, signal.v)) {
    signal.v = value;
    signal.w++;
    if (is_runes(null) && !ignore_mutation_validation && current_effect !== null && current_effect.c === null && (current_effect.f & CLEAN) !== 0 && (current_effect.f & MANAGED) === 0) {
      if (current_dependencies !== null && current_dependencies.includes(signal)) {
        set_signal_status(current_effect, DIRTY);
        schedule_effect(current_effect, false);
      } else {
        if (current_untracked_writes === null) {
          current_untracked_writes = [signal];
        } else {
          current_untracked_writes.push(signal);
        }
      }
    }
    mark_signal_consumers(signal, DIRTY, true);
  }
}
function destroy_signal(signal) {
  const teardown = (
    /** @type {null | (() => void)} */
    signal.v
  );
  const destroy = signal.y;
  const flags = signal.f;
  destroy_references(signal);
  remove_consumers(signal, 0);
  signal.i = signal.r = signal.y = signal.x = signal.b = signal.d = signal.c = null;
  set_signal_status(signal, DESTROYED);
  if (destroy !== null) {
    if (is_array(destroy)) {
      run_all(destroy);
    } else {
      destroy();
    }
  }
  if (teardown !== null && (flags & IS_EFFECT) !== 0) {
    teardown();
  }
}
function untrack(fn) {
  const previous_untracking = current_untracking;
  try {
    current_untracking = true;
    return fn();
  } finally {
    current_untracking = previous_untracking;
  }
}
const STATUS_MASK = ~(DIRTY | MAYBE_DIRTY | CLEAN);
function set_signal_status(signal, status) {
  signal.f = signal.f & STATUS_MASK | status;
}
function push(props, runes = false, fn) {
  current_component_context = {
    // exports (and props, if `accessors: true`)
    x: null,
    // context
    c: null,
    // effects
    e: null,
    // mounted
    m: false,
    // parent
    p: current_component_context,
    // signals
    d: null,
    // props
    s: props,
    // runes
    r: runes,
    // update_callbacks
    u: null
  };
}
function pop(component) {
  const context_stack_item = current_component_context;
  if (context_stack_item !== null) {
    if (component !== void 0) {
      context_stack_item.x = component;
    }
    const effects = context_stack_item.e;
    if (effects !== null) {
      context_stack_item.e = null;
      for (let i = 0; i < effects.length; i++) {
        schedule_effect(effects[i], false);
      }
    }
    current_component_context = context_stack_item.p;
    context_stack_item.m = true;
  }
  return component || /** @type {T} */
  {};
}
function deep_read(value, visited = /* @__PURE__ */ new Set()) {
  if (typeof value === "object" && value !== null && // We don't want to traverse DOM elements
  !(value instanceof EventTarget) && !visited.has(value)) {
    visited.add(value);
    for (let key in value) {
      try {
        deep_read(value[key], visited);
      } catch (e) {
      }
    }
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== Map.prototype && proto !== Set.prototype && proto !== Date.prototype) {
      const descriptors = get_descriptors(proto);
      for (let key in descriptors) {
        const get2 = descriptors[key].get;
        if (get2) {
          try {
            get2.call(value);
          } catch (e) {
          }
        }
      }
    }
  }
}
var node_prototype;
var element_prototype;
var text_prototype;
var append_child_method;
var clone_node_method;
var first_child_get;
var next_sibling_get;
function init_operations() {
  if (node_prototype !== void 0) {
    return;
  }
  node_prototype = Node.prototype;
  element_prototype = Element.prototype;
  text_prototype = Text.prototype;
  append_child_method = node_prototype.appendChild;
  clone_node_method = node_prototype.cloneNode;
  element_prototype.__click = void 0;
  text_prototype.__nodeValue = " ";
  element_prototype.__className = "";
  first_child_get = /** @type {(this: Node) => ChildNode | null} */
  // @ts-ignore
  get_descriptor(node_prototype, "firstChild").get;
  next_sibling_get = /** @type {(this: Node) => ChildNode | null} */
  // @ts-ignore
  get_descriptor(node_prototype, "nextSibling").get;
  // @ts-ignore
  get_descriptor(node_prototype, "textContent").set;
  // @ts-ignore
  get_descriptor(element_prototype, "className").set;
}
function append_child(element, child2) {
  append_child_method.call(element, child2);
}
// @__NO_SIDE_EFFECTS__
function clone_node(node, deep) {
  return (
    /** @type {N} */
    clone_node_method.call(node, deep)
  );
}
function empty() {
  return document.createTextNode("");
}
// @__NO_SIDE_EFFECTS__
function child(node) {
  const child2 = first_child_get.call(node);
  return child2;
}
// @__NO_SIDE_EFFECTS__
function sibling(node, is_text = false) {
  const next_sibling = next_sibling_get.call(node);
  return next_sibling;
}
function create_fragment_from_html(html) {
  var elem = document.createElement("template");
  elem.innerHTML = html;
  return elem.content;
}
function insert(current, parent_element, sibling2) {
  if (is_array(current)) {
    var i = 0;
    var node;
    for (; i < current.length; i++) {
      node = current[i];
      if (sibling2 === null) {
        append_child(
          /** @type {Element} */
          parent_element,
          /** @type {Node} */
          node
        );
      } else {
        sibling2.before(
          /** @type {Node} */
          node
        );
      }
    }
    return current[0];
  } else if (current !== null) {
    if (sibling2 === null) {
      append_child(
        /** @type {Element} */
        parent_element,
        /** @type {Node} */
        current
      );
    } else {
      sibling2.before(
        /** @type {Node} */
        current
      );
    }
  }
  return (
    /** @type {Text | Element | Comment} */
    current
  );
}
function remove(current) {
  var first_node = current;
  if (is_array(current)) {
    var i = 0;
    var node;
    for (; i < current.length; i++) {
      node = current[i];
      if (i === 0) {
        first_node = node;
      }
      if (node.isConnected) {
        node.remove();
      }
    }
  } else if (current.isConnected) {
    current.remove();
  }
  return (
    /** @type {Element | Comment | Text} */
    first_node
  );
}
const PassiveDelegatedEvents = ["touchstart", "touchmove", "touchend"];
function create_root_block(intro) {
  return {
    // dom
    d: null,
    // effect
    e: null,
    // intro
    i: intro,
    // parent
    p: null,
    // transition
    r: null,
    // type
    t: ROOT_BLOCK
  };
}
const all_registerd_events = /* @__PURE__ */ new Set();
const root_event_handles = /* @__PURE__ */ new Set();
// @__NO_SIDE_EFFECTS__
function template(html, return_fragment) {
  let cached_content;
  return () => {
    if (cached_content === void 0) {
      const content = create_fragment_from_html(html);
      cached_content = return_fragment ? content : (
        /** @type {Node} */
        /* @__PURE__ */ child(content)
      );
    }
    return cached_content;
  };
}
function open_template(is_fragment, use_clone_node, anchor, template_element_fn) {
  return use_clone_node ? /* @__PURE__ */ clone_node(
    /** @type {() => Element} */
    template_element_fn(),
    true
  ) : document.importNode(
    /** @type {() => Element} */
    template_element_fn(),
    true
  );
}
// @__NO_SIDE_EFFECTS__
function open(anchor, use_clone_node, template_element_fn) {
  return open_template(false, use_clone_node, anchor, template_element_fn);
}
function close_template(dom, is_fragment, anchor) {
  const block = (
    /** @type {import('./types.js').Block} */
    current_block
  );
  const current = is_fragment ? is_array(dom) ? dom : (
    /** @type {import('./types.js').TemplateNode[]} */
    Array.from(dom.childNodes)
  ) : dom;
  if (anchor !== null) {
    insert(current, null, anchor);
  }
  block.d = current;
}
function close(anchor, dom) {
  close_template(dom, false, anchor);
}
function event(event_name, dom, handler, capture, passive) {
  const options = {
    capture,
    passive
  };
  function target_handler(event2) {
    handle_event_propagation(dom, event2);
    if (!event2.cancelBubble) {
      return handler.call(this, event2);
    }
  }
  dom.addEventListener(event_name, target_handler, options);
  if (dom === document.body || dom === window || dom === document) {
    render_effect(() => {
      return () => {
        dom.removeEventListener(event_name, target_handler, options);
      };
    });
  }
}
function text_effect(dom, value) {
  render_effect(() => text(dom, value()));
}
function text(dom, value) {
  const prev_node_value = dom.__nodeValue;
  const next_node_value = stringify(value);
  if (prev_node_value !== next_node_value) {
    dom.nodeValue = next_node_value;
    dom.__nodeValue = next_node_value;
  }
}
function handle_event_propagation(handler_element, event2) {
  var _a;
  const owner_document = handler_element.ownerDocument;
  const event_name = event2.type;
  const path = ((_a = event2.composedPath) == null ? void 0 : _a.call(event2)) || [];
  let current_target = (
    /** @type {null | Element} */
    path[0] || event2.target
  );
  if (event2.target !== current_target) {
    define_property(event2, "target", {
      configurable: true,
      value: current_target
    });
  }
  let path_idx = 0;
  const handled_at = event2.__root;
  if (handled_at) {
    const at_idx = path.indexOf(handled_at);
    if (at_idx !== -1 && (handler_element === document || handler_element === /** @type {any} */
    window)) {
      event2.__root = handler_element;
      return;
    }
    const handler_idx = path.indexOf(handler_element);
    if (handler_idx === -1) {
      return;
    }
    if (at_idx <= handler_idx) {
      path_idx = at_idx + 1;
    }
  }
  current_target = /** @type {Element} */
  path[path_idx] || event2.target;
  define_property(event2, "currentTarget", {
    configurable: true,
    get() {
      return current_target || owner_document;
    }
  });
  while (current_target !== null) {
    const parent_element = current_target.parentNode || /** @type {any} */
    current_target.host || null;
    const internal_prop_name = "__" + event_name;
    const delegated = current_target[internal_prop_name];
    if (delegated !== void 0 && !/** @type {any} */
    current_target.disabled) {
      if (is_array(delegated)) {
        const [fn, ...data] = delegated;
        fn.apply(current_target, [event2, ...data]);
      } else {
        delegated.call(current_target, event2);
      }
    }
    if (event2.cancelBubble || parent_element === handler_element || current_target === handler_element) {
      break;
    }
    current_target = parent_element;
  }
  event2.__root = handler_element;
  current_target = handler_element;
}
function stringify(value) {
  return typeof value === "string" ? value : value == null ? "" : value + "";
}
function attr(dom, attribute, value) {
  value = value == null ? null : value + "";
  {
    if (value === null) {
      dom.removeAttribute(attribute);
    } else {
      dom.setAttribute(attribute, value);
    }
  }
}
function mount(component, options) {
  init_operations();
  const anchor = empty();
  options.target.appendChild(anchor);
  return flush_sync(() => _mount(component, __spreadProps(__spreadValues({}, options), { anchor })), false);
}
function _mount(Component, options) {
  const registered_events = /* @__PURE__ */ new Set();
  const container = options.target;
  const block = create_root_block(options.intro || false);
  let component = void 0;
  const effect = render_effect(
    () => {
      if (options.context) {
        push({});
        current_component_context.c = options.context;
      }
      if (!options.props) {
        options.props = /** @type {Props} */
        {};
      }
      if (options.events) {
        options.props.$$events = options.events;
      }
      component = // @ts-expect-error the public typings are not what the actual function looks like
      Component(options.anchor, options.props) || {};
      if (options.context) {
        pop();
      }
    },
    block,
    true
  );
  block.e = effect;
  const bound_event_listener = handle_event_propagation.bind(null, container);
  const bound_document_event_listener = handle_event_propagation.bind(null, document);
  const event_handle = (events) => {
    for (let i = 0; i < events.length; i++) {
      const event_name = events[i];
      if (!registered_events.has(event_name)) {
        registered_events.add(event_name);
        container.addEventListener(
          event_name,
          bound_event_listener,
          PassiveDelegatedEvents.includes(event_name) ? {
            passive: true
          } : void 0
        );
        document.addEventListener(
          event_name,
          bound_document_event_listener,
          PassiveDelegatedEvents.includes(event_name) ? {
            passive: true
          } : void 0
        );
      }
    }
  };
  event_handle(array_from(all_registerd_events));
  root_event_handles.add(event_handle);
  mounted_components.set(component, () => {
    for (const event_name of registered_events) {
      container.removeEventListener(event_name, bound_event_listener);
    }
    root_event_handles.delete(event_handle);
    const dom = block.d;
    if (dom !== null) {
      remove(dom);
    }
    destroy_signal(
      /** @type {import('./types.js').EffectSignal} */
      block.e
    );
  });
  return component;
}
let mounted_components = /* @__PURE__ */ new WeakMap();
function init() {
  const context = (
    /** @type {import('./types.js').ComponentContext} */
    current_component_context
  );
  const callbacks = context.u;
  if (!callbacks)
    return;
  pre_effect(() => {
    observe_all(context);
    callbacks.b.forEach(run);
  });
  user_effect(() => {
    const fns = untrack(() => callbacks.m.map(run));
    return () => {
      for (const fn of fns) {
        if (typeof fn === "function") {
          fn();
        }
      }
    };
  });
  user_effect(() => {
    observe_all(context);
    callbacks.a.forEach(run);
  });
}
function observe_all(context) {
  if (context.d) {
    for (const signal of context.d)
      get(signal);
  }
  deep_read(context.s);
}
const PUBLIC_VERSION = "5";
if (typeof window !== "undefined")
  (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
const svelteLogo = "data:image/svg+xml,%3csvg%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20aria-hidden='true'%20role='img'%20class='iconify%20iconify--logos'%20width='26.6'%20height='32'%20preserveAspectRatio='xMidYMid%20meet'%20viewBox='0%200%20256%20308'%3e%3cpath%20fill='%23FF3E00'%20d='M239.682%2040.707C211.113-.182%20154.69-12.301%20113.895%2013.69L42.247%2059.356a82.198%2082.198%200%200%200-37.135%2055.056a86.566%2086.566%200%200%200%208.536%2055.576a82.425%2082.425%200%200%200-12.296%2030.719a87.596%2087.596%200%200%200%2014.964%2066.244c28.574%2040.893%2084.997%2053.007%20125.787%2027.016l71.648-45.664a82.182%2082.182%200%200%200%2037.135-55.057a86.601%2086.601%200%200%200-8.53-55.577a82.409%2082.409%200%200%200%2012.29-30.718a87.573%2087.573%200%200%200-14.963-66.244'%3e%3c/path%3e%3cpath%20fill='%23FFF'%20d='M106.889%20270.841c-23.102%206.007-47.497-3.036-61.103-22.648a52.685%2052.685%200%200%201-9.003-39.85a49.978%2049.978%200%200%201%201.713-6.693l1.35-4.115l3.671%202.697a92.447%2092.447%200%200%200%2028.036%2014.007l2.663.808l-.245%202.659a16.067%2016.067%200%200%200%202.89%2010.656a17.143%2017.143%200%200%200%2018.397%206.828a15.786%2015.786%200%200%200%204.403-1.935l71.67-45.672a14.922%2014.922%200%200%200%206.734-9.977a15.923%2015.923%200%200%200-2.713-12.011a17.156%2017.156%200%200%200-18.404-6.832a15.78%2015.78%200%200%200-4.396%201.933l-27.35%2017.434a52.298%2052.298%200%200%201-14.553%206.391c-23.101%206.007-47.497-3.036-61.101-22.649a52.681%2052.681%200%200%201-9.004-39.849a49.428%2049.428%200%200%201%2022.34-33.114l71.664-45.677a52.218%2052.218%200%200%201%2014.563-6.398c23.101-6.007%2047.497%203.036%2061.101%2022.648a52.685%2052.685%200%200%201%209.004%2039.85a50.559%2050.559%200%200%201-1.713%206.692l-1.35%204.116l-3.67-2.693a92.373%2092.373%200%200%200-28.037-14.013l-2.664-.809l.246-2.658a16.099%2016.099%200%200%200-2.89-10.656a17.143%2017.143%200%200%200-18.398-6.828a15.786%2015.786%200%200%200-4.402%201.935l-71.67%2045.674a14.898%2014.898%200%200%200-6.73%209.975a15.9%2015.9%200%200%200%202.709%2012.012a17.156%2017.156%200%200%200%2018.404%206.832a15.841%2015.841%200%200%200%204.402-1.935l27.345-17.427a52.147%2052.147%200%200%201%2014.552-6.397c23.101-6.006%2047.497%203.037%2061.102%2022.65a52.681%2052.681%200%200%201%209.003%2039.848a49.453%2049.453%200%200%201-22.34%2033.12l-71.664%2045.673a52.218%2052.218%200%200%201-14.563%206.398'%3e%3c/path%3e%3c/svg%3e";
const viteLogo = "/vite.svg";
var frag$1 = /* @__PURE__ */ template(`<button> </button>`);
function Counter($$anchor, $$props) {
  push($$props, true);
  let count = /* @__PURE__ */ source(0);
  const increment = () => {
    set(count, get(count) + 1);
  };
  var button = /* @__PURE__ */ open($$anchor, true, frag$1);
  var text2 = /* @__PURE__ */ child(button);
  text_effect(text2, () => `count is ${stringify(get(count))}`);
  event("click", button, increment, false);
  close($$anchor, button);
  pop();
}
var frag = /* @__PURE__ */ template(`<main><div><a href="https://vitejs.dev" target="_blank" rel="noreferrer"><img class="logo svelte-11cv5lq" alt="Vite Logo"></a> <a href="https://svelte.dev" target="_blank" rel="noreferrer"><img class="logo svelte svelte-11cv5lq" alt="Svelte Logo"></a></div> <h1>Vite + Svelte</h1> <div class="card"><!></div> <p>Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!</p> <p class="read-the-docs svelte-11cv5lq">Click on the Vite and Svelte logos to learn more</p></main>`);
function App($$anchor, $$props) {
  push($$props, false);
  init();
  var main = /* @__PURE__ */ open($$anchor, true, frag);
  var div = /* @__PURE__ */ child(main);
  var a = /* @__PURE__ */ child(div);
  var img = /* @__PURE__ */ child(a);
  attr(img, "src", viteLogo);
  var a_1 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(a, true));
  var img_1 = /* @__PURE__ */ child(a_1);
  attr(img_1, "src", svelteLogo);
  var h1 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(div, true));
  var div_1 = /* @__PURE__ */ sibling(/* @__PURE__ */ sibling(h1, true));
  var node = /* @__PURE__ */ child(div_1);
  Counter(node, {});
  close($$anchor, main);
  pop();
}
mount(App, {
  target: document.getElementById("app")
});
