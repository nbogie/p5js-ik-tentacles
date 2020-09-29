interface Target {
  pos(): p5.Vector;
}

class Segment {
  a: p5.Vector;
  b: p5.Vector;
  myColor: p5.Color;
  edgeColor: p5.Color;
  thickness: number;
  len: number;
  isFixed: boolean;
  nextSegment: Segment;
  endTarget: Target;
  myHue: number;

  constructor(
    a: p5.Vector,
    b: p5.Vector,
    nextSegment: Segment,
    thicknessScale: number,
    maxThickness: number,
    myHue: number
  ) {
    this.a = a.copy();
    this.b = b.copy();
    this.isFixed = false;
    this.len = a.dist(b);
    colorMode(HSB, 100);
    this.nextSegment = nextSegment;
    this.endTarget = null;
    this.myHue = myHue;
    const sat = 50;
    const bright = 50;
    this.myColor = color(this.myHue, sat, random(bright - 10, bright + 10));
    this.edgeColor = color(this.myHue, sat, bright - 20);
    this.thickness = thicknessScale * maxThickness * random(0.9, 1.1);
  }

  pos(): p5.Vector {
    return this.a.copy();
  }
  getAngle(): number {
    return V.sub(this.b, this.a).heading();
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

  static createRandomSegmentAt(
    posA: p5.Vector,
    nextSegment: Segment,
    thicknessScale: number,
    maxThickness: number,
    len: number,
    myHue: number
  ) {
    const p1 = posA.copy();
    const p2 = V.add(p1, V.random2D().mult(len));
    return new Segment(
      p1,
      p2,
      nextSegment,
      thicknessScale,
      maxThickness,
      myHue
    );
  }

  update(): void {
    //Intentionally treating these two cases separately.
    if (this.nextSegment) {
      //seek target segment
      this.seekTarget(this.nextSegment.pos());
    } else {
      //seek some other target
      this.seekTarget(this.endTarget.pos());
    }
  }

  //Given a target position, move 'b' directly to that position and move 'a'
  //so that it falls on the line from old 'a' to target,
  //but conserves the segment's length, a-to-b.
  //
  //Important: overall tentacle reach is adjusted for elsewhere.  IGNORE it, here.
  seekTarget(targetPos: p5.Vector): void {
    // A straight line from this segment's base to the target.
    // We can think of this as a pulled-taught guide line.
    //New a and b will both lie on this "line".
    const aToTarget = V.sub(targetPos, this.a);

    // We're about to set b to be right on the target.
    // Prepare a back-vector that will tell us NEW a, from this new b,
    // based on our pulled-taught direction, and our (fixed) segment length.
    const bToA = aToTarget.copy().setMag(-this.len);

    //Put b right on the target.
    this.b = targetPos.copy();

    //Calculate 'a' backwards from the new 'b', with our prepared back-vector.
    this.a = V.add(this.b, bToA);
  }
}
