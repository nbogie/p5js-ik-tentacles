This is a quick take on the Coding Train's ["Coding Challenge #64.2: Inverse Kinematics" (with p5.js)](https://www.youtube.com/watch?v=hbgDqyy8bIw)

# Branches:

- master: simple, which splits into:

  EITHER:

- master-monster-class: move tentacle handling into a Monster class, and out of index.

  OR

- feature-dom-interaction: tentacles interact with words in DOM

# Build

For **only** a build:

`npm run mybuild`

To start dev, with build in watch mode, and launch a browser, use:

`npm start`

# Netlify deploy settings

**Build command:**

`npm run mybuild`

**Publish directory:**

not needed - index.html already looks for `build/build.js`

Credits:

- Old Typewriter typeface by M-Dfonts (free for personal use): https://www.dafont.com/old-typewriter.font

![playing with Canva](./screenshots/InverseKinematicsTentacles.png?raw=true)
