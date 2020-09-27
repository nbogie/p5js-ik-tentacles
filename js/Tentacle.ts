class Tentacle {
  segments: Segment[];
  provideTarget: () => p5.Vector;

  constructor(
    numSegments: number,
    fullLength: number,
    maxThickness: number,
    baseHueOf100: number,
    provideTarget: () => p5.Vector
  ) {
    const myHue = random(baseHueOf100 - 5, baseHueOf100 + 5);
    const avgSegmentLength = fullLength / numSegments;
    this.provideTarget = provideTarget;

    let prevPos: p5.Vector = createVector(
      random(width * 0.4, width * 0.6),
      height * 1.1
    );
    this.segments = collectDistributedBetween(
      numSegments,
      0,
      0.9,
      (thickness, ix) => {
        const segment = Segment.createRandomAt(
          "Seg" + ix,
          prevPos,
          null,
          1 - thickness,
          maxThickness,
          avgSegmentLength,
          myHue
        );
        prevPos = segment.b.copy();
        return segment;
      }
    );
    this.segments[0].isFixed = true;

    let thinnerSegment: Segment = null;
    this.segments.reverse().forEach(seg => {
      seg.target = thinnerSegment
        ? thinnerSegment
        : { pos: this.provideTarget };
      thinnerSegment = seg;
    });
    this.segments.reverse();
  }
  update() {
    const originalLockedPos = this.segments[0].a.copy();
    this.segments.reverse();
    for (let s of this.segments) {
      s.update();
    }
    this.segments.reverse();
    const moveBackDelta = V.sub(originalLockedPos, this.segments[0].a);
    this.segments.forEach(s => s.translate(moveBackDelta));
  }

  draw() {
    if (appOptions.shouldDrawShadows) {
      for (let s of this.segments) {
        s.drawShadow();
      }
    }

    for (let s of this.segments) {
      s.drawSilhoutte();
    }
    for (let s of this.segments) {
      s.drawInner();
    }
  }
}
