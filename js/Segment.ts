interface Target {
  pos(): p5.Vector;
}
function randomColor(): p5.Color {
  colorMode(HSB, 100);
  return color(random(100), 100, 100);
}
class Segment implements Target {
  a: p5.Vector;
  b: p5.Vector;
  id: string;
  myColor: p5.Color;
  edgeColor: p5.Color;
  thickness: number;
  len: number;
  isFixed: boolean;
  target: Target;
  targetColor: p5.Color;
  myHue: number;
  constructor(
    id: string,
    a: p5.Vector,
    b: p5.Vector,
    target: Target,
    thicknessScale: number,
    maxThickness: number,
    myHue: number
  ) {
    this.id = id;
    this.a = a.copy();
    this.b = b.copy();
    this.isFixed = false;
    this.len = a.dist(b);
    colorMode(HSB, 100);
    this.target = target;
    this.myHue = myHue;
    const sat = 50;
    const bright = 50;
    this.myColor = color(this.myHue, sat, random(bright - 10, bright + 10));
    this.edgeColor = color(this.myHue, sat, bright - 20);
    this.thickness = thicknessScale * maxThickness * random(0.9, 1.1);
    this.targetColor = randomColor();
  }
  pos(): p5.Vector {
    return this.a.copy();
  }
  translate(offset: p5.Vector) {
    this.a.add(offset);
    this.b.add(offset);
  }
  drawShadow() {
    const off = createVector(20, 10);
    stroke(color(this.myHue, 0, 0, 20));
    noFill();
    strokeWeight(this.thickness);
    line(
      off.x + this.a.x,
      off.y + this.a.y,
      off.x + this.b.x,
      off.y + this.b.y
    );
  }
  drawSilhoutte() {
    noFill();
    stroke(10);
    strokeWeight(this.thickness);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
  drawInner() {
    //strokeCap(SQUARE);
    stroke(this.myColor);
    strokeWeight(this.thickness * 0.8);
    line(this.a.x, this.a.y, this.b.x, this.b.y);
  }
  static drawCrosshairAt(pos: p5.Vector, colr: p5.Color) {
    strokeWeight(1.8);
    stroke(colr);
    push();
    translate(pos.x, pos.y);
    line(-8, 0, 8, 0);
    line(0, -8, 0, 8);
    pop();
  }
  midPoint(): p5.Vector {
    return this.a.copy().lerp(this.b, 0.5);
  }

  static createRandomAt(
    id: string,
    posA: p5.Vector,
    target: Target,
    thicknessScale: number,
    maxThickness: number,
    len: number,
    myHue: number
  ) {
    const p1 = posA.copy();
    const p2 = p1.copy().add(p5.Vector.random2D().mult(len));
    return new Segment(id, p1, p2, target, thicknessScale, maxThickness, myHue);
  }
  update(): void {
    this.seekTarget(this.target.pos());
  }

  seekTarget(targetPos: p5.Vector): void {
    const deltaToTarget = targetPos.copy().sub(this.a);
    this.a = targetPos.copy().add(
      deltaToTarget
        .copy()
        .normalize()
        .mult(-this.len)
    );
    this.b = targetPos.copy();
  }
}
