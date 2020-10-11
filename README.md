# GViz

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Install Node.js dependencies with `npm install` inside the `assets` directory
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Notes

### Drawing directional arrows
Used a combination of:
* https://stackoverflow.com/questions/11121465/scaling-an-arrowhead-on-a-d3-force-layout-link-marker
* https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end

Main things to remember:
- The arrow head size is proportional to the stroke width
- The arrow head is drawn with a svg marker element

## Meta

Helps you answer questions about the Elixir code base:
* What files will cause this file to recompile
* What files does this cause to recompile
* And maybe:
  * What files trigger the most other files to recompile? (can mostly see this visually)
  * What files are most often triggered

TODO:
- [ ] Click on a node to keep it selected
- [x] Show a list of files on the left
- [x] Allow filtering in the list of files
- [ ] Have a mode to show what files this file will trigger to compile
- [ ] Arrow colors should match the lines

Future:
- Configurable node coloring based on filename prefix

Ideas:
- can you click on a node and give it gravity
  put the selected node at the top and then the rest will hang down based on
  how many jumps they are away
- Hook this up to show which files are being recompiled live, flash them as red
  and then slowly fade back to black
  - This might require hooking up to ElixirLS or another build tool (like
    exsync), although alternatively you might be able to add a custom compiler
    to your project, although that's more invasive than what I was originally
    envisioning. But maybe my stand-alone application can spin up a new beam
    instance that will control it's own compilation (have it's own build path)
    and avoid conflicts that way.
