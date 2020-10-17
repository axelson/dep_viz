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

Other interesting links:
* https://gist.github.com/unixod/e932a181c1125921fa638f702376c295
  * Some other means of using graphviz for visualizing larger graphs
* https://github.com/magjac/d3-graphviz/issues/152
  * Information about using webpack with d3-graphviz

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
- [ ] Have a mode to show what files this file will trigger to compile
- [ ] When hovering a node, show compilation dependencies in info box
- [ ] Allow choosing a preset xref_graph.dot to be shown via dropdown
- [ ] Allow dragging when in focused mode
- [ ] node centric force layout is buggy
  - [ ] transition to the layout sometimes keeps the discarded nodes for too long
  - Maybe need to add special handling for `unShowNodeCompileDeps` when transitioning to node-centric force layout
  - [x] tooltip doesn't match node labels (labels are incorrect)
- [ ] Node centric force layout is not well centered
  - Can we apply a higher degree of force to keep it more spread out and higher up?
- [ ] Node centric force layout always highlight the selected node
- [ ] Node centric force layout have way to go back to normal layout
- [ ] Use info box to show files that will be recompiled most often
  - [ ] Calculate this not on the main thread
  - [ ] Cache this calculation to be re-used when hovering

Done:
- [x] Show a list of files on the left
- [x] Allow filtering in the list of files
- [x] Allow dragging
- [x] Only render the labels when hovering
- [x] When hovering, remove tooltip
  - Replace with making the node label always show, and be larger for the current node
- [x] adding the labels appears to have negatively impacted performance
- [x] Click on a node to keep it selected
  - Didn't implement this in the way I was originally envisioning

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
