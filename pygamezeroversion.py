# Inverse Kinematics tenacles with python and pygamezero
# Roughly following Daniel Shiffman's algorithm:
#   https://www.youtube.com/watch?v=xXjRlEr7AGk

# pygamezero docs:
# https://pygame-zero.readthedocs.io/en/stable/builtins.html

import math
import random

# perlin noise: https://github.com/caseman/noise
from noise import pnoise1

WIDTH = 400
HEIGHT = 600
TITLE = "IK Tentacles"


def randomRGB():
    # TODO: look in pygame for HSB / HSV  - none in pygamezero
    most = random.randint(50, 80)
    low1 = random.randint(0, 40)
    low2 = random.randint(0, 40)
    return (low2, most, low1)


# TODO: namespace / module these vector fns, or use a library
# I tried using this library but the docs didn't match the impl:
# https://github.com/allelos/vectors
# from vectors import Point, Vector


def polarToVec(angle, mag):
    x = mag * math.sin(angle)
    y = mag * math.cos(angle)
    return (x, y)


def vecMag(v):
    x = v[0]
    y = v[1]
    return math.sqrt(x * x + y * y)


def vecSub(v1, v2):
    return vecAdd(v1, vecMult(v2, -1))


def vecNorm(v):
    mag = vecMag(v)
    if mag == 0:
        return (0, 0)
    return vecMult(v, 1 / mag)


def vecAdd(v1, v2):
    return (v1[0] + v2[0], v1[1] + v2[1])


def vecMult(v, s):
    return (v[0] * s, v[1] * s)


class Tentacle:
    def __init__(self, nSegs, totalLen, basePos, rgb):
        self.segments = []
        self.isFixedBase = True
        self.noisePhase = random.randint(0, 9999)  # doesn't need to be unique
        self.rgb = rgb
        avgSegLen = totalLen / nSegs
        prevPos = basePos

        for i in range(nSegs):
            seg = Segment(i, 1 - (i / nSegs), prevPos, 0, avgSegLen, self.rgb)
            self.segments.append(seg)
            prevPos = seg.b

        prevTarget = (300, 400)
        for s in self.segments:
            s.setTarget(prevTarget)
            prevTarget = s.getA()

    def updateTentacle(self, targetPos):
        basePosBeforeUpdate = self.firstSeg().getA()

        prev = None
        # populate the upated target positions for each segment
        for s in reversed(self.segments):
            s.setTarget(prev)
            if prev is None:
                s.setTarget(targetPos)
            s.seekOwnTarget()
            prev = s.getA()

        basePosAfterUpdate = self.firstSeg().getA()
        restorativeVec = vecSub(basePosBeforeUpdate, basePosAfterUpdate)

        if self.isFixedBase:
            for s in self.segments:
                s.translate(restorativeVec)

    def draw(self):
        for s in self.segments:
            s.drawSilhouette()
        for s in self.segments:
            s.drawMain()

    def getNoisePhase(self):
        return self.noisePhase

    def firstSeg(self):
        return self.segments[0]

    def lastSeg(self):
        return self.segments[-1]

    def __str__(self):
        return "Tentacle with %s segments, base seg: %s" % (
            len(self.segments),
            self.firstSeg(),
        )


class Segment:
    """A segment of a tentacle"""

    def calculateB(self, angle):
        lenVec = polarToVec(angle, self.length)
        self.b = vecAdd(lenVec, self.a)

    def __init__(self, myID, myFraction, a, angle, length, rgb):
        self.myID = myID
        self.myFraction = myFraction
        self.a = a
        self.length = length
        self.b = None
        self.calculateB(angle)
        self.target = None
        self.rgb = rgb

    def getA(self):
        return self.a

    def setTarget(self, target):
        self.target = target

    def drawMain(self):
        a = self.a
        b = self.b
        screen.draw.line(a, b, (self.rgb))
        screen.draw.filled_circle(b, int(5 + self.myFraction * 20), (self.rgb))

    def drawSilhouette(self):
        b = self.b
        screen.draw.filled_circle(b, int(8 + self.myFraction * 20), (0, 0, 0))

    def vecAToB(self):
        return vecSub(self.b, self.a)

    def __str__(self):
        a = self.a
        b = self.b
        return "Seg from (%s, %s) to (%s, %s)" % (a[0], a[1], b[0], b[1])

    def translate(self, vec):
        self.a = vecAdd(self.a, vec)
        self.b = vecAdd(self.b, vec)

    def len(self):
        return vecMag(self.vecAToB())

    def seekOwnTarget(self):
        return self.seek(self.target)

    def seek(self, targetPos):
        if not targetPos:
            return

        oldLen = self.len()
        aToTarget = vecSub(targetPos, self.a)
        atnorm = vecNorm(aToTarget)
        backVec = vecMult(atnorm, -oldLen)
        newA = vecAdd(targetPos, backVec)
        self.b = targetPos
        self.a = newA


def on_mouse_move(pos, buttons):
    global mousePos
    mousePos = pos
    global frameOfLastMovement
    frameOfLastMovement = frameNum


def mouseIsQuiet():
    return frameNum - frameOfLastMovement > 60


def update():
    global frameNum
    if keyboard.space:
        togglePause()
    if isPaused:
        return

    for t in tentacles:
        if mouseIsQuiet():
            currentTarget = generateTarget(t.getNoisePhase())
        else:
            currentTarget = mousePos
        t.updateTentacle(currentTarget)
    frameNum += 1


# Use perlin noise over time to buzz around a portion of the screen
def generateTarget(phase):
    x = WIDTH / 2 + WIDTH * 0.5 * pnoise1(phase * 10 + frameNum / 300, 1)
    y = (HEIGHT * 0.7) + HEIGHT * 0.5 * pnoise1(phase * 22 + frameNum / 400, 1)
    return (int(x), int(y))


def togglePause():
    global isPaused
    isPaused = not isPaused


def draw():
    bgcolor = (20, 20, 20)
    screen.fill(bgcolor)
    for t in tentacles:
        t.draw()


isPaused = False
mousePos = (0, 0)
frameNum = 0
frameOfLastMovement = 0

tentacles = []
for i in range(6):
    colr = randomRGB()
    length = random.randint(HEIGHT * 0.7, HEIGHT * 0.9)
    basePos = (random.randint(170, 230), HEIGHT + 30)
    tentacles.append(Tentacle(40, length, basePos, colr))
