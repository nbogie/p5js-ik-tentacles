function randomScreenPosition(): p5.Vector {
  return createVector(random(width), random(height));
}

function centerScreenPos(): p5.Vector {
  return createVector(width / 2, height / 2);
}

function randomInt(min: number, max: number): number {
  return round(random(min, max));
}

function translateToVec(pos: p5.Vector): void {
  translate(pos.x, pos.y);
}
function rotateVertexAround(
  vertex: p5.Vector,
  rotOrigin: p5.Vector,
  angleRad: number
): p5.Vector {
  return V.sub(vertex, rotOrigin)
    .rotate(angleRad)
    .add(rotOrigin);
}

/** Find the minimum of the given list after applying fn() to each.
 * Return the minimum, first minimum, or undefined if there are no items.
 */
function minBy<T>(list: T[], fn: (item: T) => number): T {
  if (list.length < 0) {
    return undefined;
  }
  let recordItem = list[0];
  let recordWeight = fn(list[0]);
  for (let item of list) {
    const weight = fn(item);
    if (weight > recordWeight) {
      recordWeight = weight;
      recordItem = item;
    }
  }
  return recordItem;
}

/** Repeatedly call the given function fn, num times, throwing any output away. */
function repeat(num: number, fn: (ix: number) => void) {
  for (let i = 0; i < num; i++) {
    fn(i);
  }
}

function distributeUpTo(total: number, max: number, fn: (v: number) => void) {
  repeat(total, ix => {
    const val = (ix * max) / total;
    return fn(val);
  });
}
/** 
Collect a set of values generated with fn called with 
a range of numSamples samples distributed evenly from min to max.
*/
function collectDistributedBetween<T>(
  numSamples: number,
  min: number,
  max: number,
  fn: (v: number, ix?: number) => T
): T[] {
  const result: T[] = [];
  distributeBetween(numSamples, min, max, (v, ix) => result.push(fn(v, ix)));
  return result;
}
function distributeBetween(
  numSamples: number,
  min: number,
  max: number,
  fn: (v: number, ix?: number) => void
) {
  repeat(numSamples, ix => {
    const range = max - min;
    const val = min + (ix * range) / numSamples;
    return fn(val, ix);
  });
}
function averageVectors(vs: p5.Vector[]): p5.Vector {
  if (vs.length < 1) {
    return createVector(0, 0);
  }
  return vs.reduce((v1, v2) => V.add(v1, v2), vs[0]).div(vs.length);
}

function randomBoolean(): boolean {
  return Math.random() > 0.5;
}
function mousePosAsVector(): p5.Vector {
  return createVector(mouseX, mouseY);
}
function collect<T>(n: number, fn: (ix: number) => T): T[] {
  const res = [];
  for (let i = 0; i < n; i++) {
    res.push(fn(i));
  }
  return res;
}
