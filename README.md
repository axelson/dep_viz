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

Top annoyances:
- Hard to find the specific files that the currently highlighted node depends on
- Hard to tell how many files are "behind" each compilation dependency
  - i.e. if a file has 3 compilation dependencies it's hard to see how many
    files each of those dependencies is contributing

## Meta

Helps you answer questions about the Elixir code base:
* What files will cause this file to recompile
* What files does this cause to recompile
* And maybe:
  * What files trigger the most other files to recompile? (can mostly see this visually)
  * What files are most often triggered
  
Questions:
- How do you switch between the file list and the top stats?
- Should an elixir project have any files that recompiled very often? Seems to
  usually be something you don't want (although of course there are some times
  that it is needed)

TODO:
- [x] When hover, in the info box show the outgoing dependencies
- [ ] Have a mode to show what files this file will trigger to compile
  - Show the mode selector in the upper right
- [x] When hovering a node, show compilation dependencies in info box
- [ ] Use different colors
  - [ ] Selected node shouldn't be same color as compile-time dependencies
  - [ ] Files that will case this file to recompile, and files this causes to
        recompile should be two separate colors
- [x] Hide node-centric force layout for now
- [ ] Allow choosing a preset xref_graph.dot to be shown via dropdown
- [ ] Show which compile-links cause the most files to be compiled
- [ ] Create a glossary
- [ ] Create a "score" for the repository or the file
  - Based on the number of files that cause the top files to get recompiled
- [ ] Force layout charge should be set based on the number of nodes
- [x] Use a tab layout to switch between "All files" and "Top stats"

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
- [x] Use info box to show files that will be recompiled most often
  - [x] Calculate this not on the main thread
  - [x] Cache this calculation to be re-used when hovering

Future:
- Configurable node coloring based on filename prefix
- "Live" view of a project selected interactively
  - Maybe even launch the project via bakeware?
- [ ] node centric force layout polish
  - [ ] transition to the layout sometimes keeps the discarded nodes for too long
  - Maybe need to add special handling for `unShowNodeCompileDeps` when transitioning to node-centric force layout
  - [x] tooltip doesn't match node labels (labels are incorrect)
  - [ ] Allow dragging
  - [ ] Node centric force layout always highlight the selected node
  - [ ] Node centric force layout have way to go back to normal layout
  - [ ] Node centric force layout is not well centered
    - Can we apply a higher degree of force to keep it more spread out and higher up?

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

# Glossary

Compile dependency - The current file depends on this file at compile-time
