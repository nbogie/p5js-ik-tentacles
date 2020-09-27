interface TargetProvider {
  pos(): p5.Vector;
}

interface HeldDOMWord {
  elem: HTMLElement;
  originalPosAndBounds: TargetWordPos;
}
class Tentacle {
  segments: Segment[];
  provideTarget: TargetProvider;

  heldWord?: HeldDOMWord;

  constructor(
    numSegments: number,
    fullLength: number,
    maxThickness: number,
    baseHueOf100: number,
    provideTarget: TargetProvider
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
    this.segments.reverse().forEach((seg) => {
      seg.target = thinnerSegment ? thinnerSegment : this.provideTarget;
      thinnerSegment = seg;
    });
    this.segments.reverse();
  }
  lastSegmentTheTip(): Segment {
    return this.segments.length > 0
      ? this.segments[this.segments.length - 1]
      : undefined;
  }

  firstSegmentTheRoot(): Segment {
    return this.segments.length > 0 ? this.segments[0] : undefined;
  }
  setNewTargetProvider(givenTargetProvider: TargetProvider): void {
    this.provideTarget = givenTargetProvider;
    this.lastSegmentTheTip().target = givenTargetProvider;
  }
  update() {
    const originalLockedPos = this.segments[0].a.copy();
    this.segments.reverse();
    for (let s of this.segments) {
      s.update();
    }
    this.segments.reverse();
    const moveBackDelta = V.sub(originalLockedPos, this.segments[0].a);
    this.segments.forEach((s) => s.translate(moveBackDelta));
  }

  draw() {
    if (appOptions.shouldDrawShadows) {
      for (let s of this.segments) {
        s.drawShadow();
      }
    }
    if (appOptions.shouldDrawSilhoutte) {
      for (let s of this.segments) {
        s.drawSilhoutte();
      }
    }
    for (let s of this.segments) {
      s.drawInner();
    }
  }
}
