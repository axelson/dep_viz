# DepViz

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Install Node.js dependencies with `npm install` inside the `assets` directory
  * Start Phoenix endpoint with `mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

## Notes

Other interesting links:
* https://gist.github.com/unixod/e932a181c1125921fa638f702376c295
  * Some other means of using graphviz for visualizing larger graphs
* https://github.com/magjac/d3-graphviz/issues/152
  * Information about using webpack with d3-graphviz

Main things to remember:
- The arrow head size is proportional to the stroke width
- The arrow head is drawn with a svg marker element

Top annoyances with current implementation:
- Hard to find the specific files that the currently highlighted node depends on
- Hard to tell how many files are "behind" each compilation dependency
  - i.e. if a file has 3 compilation dependencies it's hard to see how many
    files each of those dependencies is contributing
  - Or hard to tell which files are behind the compilation dependency

## Meta

Core: Elixir Developers don't want to have to wait for files to be recompiled while developing

Therefore, Elixir Developers want to minimize compile dependencies (especially of files that are slow to recompile)

Helps you answer questions about the Elixir code base:
* Why when I change file A does it cause 100 files to recompile?
  * Investigate: What files will **cause this** file to recompile?
  * Investigate: What files does **this file cause** to recompile?


* What compile dependencies do I have that I don't need (or aren't worth it)?


* Top question: What recompilation dependencies does the code base have
* And maybe:
  * What files trigger the most other files to recompile? (can mostly see this visually)
  * What files are most often triggered
  
* If we were tracking compiles of the project (store in a GenServer or file),
  then show which files are occupying the most time spent compiling
  
Questions:
- How do you switch between the file list and the top stats?
- Should an elixir project have any files that recompiled very often? Seems to
  usually be something you don't want (although of course there are some times
  that it is needed)

TODO:
- [x] Handle bad dot files
- [x] Selected node + hover: Show the compile path
  - Should this depend on the view mode?
- [x] Selected node + hover: show the files in the path in the infobox
- [x] Click on file in top stats to keep it highlighted
- [x] Hover over file in ancestors info box to see the path from that file to the selected file
- [ ] Try to implement pan and zoom
- [ ] Auto-size the main svg
- [ ] Re-size the main svg when window size changes
- [x] Selected file mode should switch when view mode is toggled
- [ ] Bug: a label gets rendered over the current node (interfering with rendering and mouse focus)
- [ ] Highlight two-way dependencies somehow
- [ ] Intro animation: Start all files in a regular grid, then add the relations and start the force layout

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
- [x] When hover, in the info box show the outgoing dependencies
- [x] Have a mode to show what files this file will trigger to compile
  - Show the mode selector in the upper right
- [x] When hovering a node, show compilation dependencies in info box
- [x] Use different colors
  - [x] Selected node shouldn't be same color as compile-time dependencies
  - [x] Files that will case this file to recompile, and files this causes to
        recompile should be two separate colors
- [x] Hide node-centric force layout for now
- [x] Create a glossary
- [x] Force layout charge should be set based on the number of nodes
- [x] Use a tab layout to switch between "All files" and "Top stats"
- [x] Change the stroke width when hovering
- [x] Add mode selector
- [x] Implement hover mode to see which files depend on the current file
- [x] when in hover mode ancestors render the compile line that causes the highlighted file to compile
- [x] Top stats: bold the current stat
- [x] Add "dependers" and "dependees" to the view mode switcher
- [x] Add updated info box hover mode for dependees view
- [x] Show the info box under the top stats list
- [x] "Has a dependency on these files" should show the total count (compile time)
- [x] Click the selected node to keep it selected, and then be able to toggle the view mode
  - [x] Also be able to see the route, or all routes between the selected file and the hovered file
    - Shortest route only?
    - Shortest route bold, others less bold, elide parts that are not part
  - [x] The label for the selected node should go away (instead just rely on the info box)
- [x] The selected node label is dissapearing on hover
- [x] Selected node + hover: Reset the colors on mouseout
- [x] Selected node + hover: Show the labels for every highlighted node
- [x] Selected node + hover: Show the labels only for the shortest path (i.e. don't show the backwards path)
- [x] Selected node + hover: Handle view mode toggled
- [x] Selected node + hover is not restoring stroke colors
- [x] Make the all files view the default
- [x] When hovering over top stats, ensure that the view mode switches appropriately
- [x] New controller action that simply serves a `.dot` file
- [x] Parse the `.dot` file in js
- [x] Allow using a user-provided `.dot` file
- [x] Allow choosing a preset xref_graph.dot to be shown via dropdown
- [x] Change the selected node to the new style
- [x] When in highlight individual file mode from roll over, use selected file
      style but in the color of the node
- [x] Selected file when switching away should reset the node force layout
- [x] All files view default fix
  - Selected file view should replace all files view
- [x] In sample, f.ex should depend on c_export.ex, yet it isn't highlighted in ancestors view
- [x] Searching should filter the top stats also
  - And maybe show the search text as well
- [x] When searching and then hovering a node, need to restore the searched nodes
- [x] When clearing a search need to restore the correct node colors
- [x] Clean up bugs in search
- [x] Top Stats: don't show files that don't cause recompiles
- [x] Top Stats: don't show files that don't get recompiled
- [x] Top Stats: when no files match top stats search, show an empty message
- [x] File search: when no files match top stats search, show an empty message
- [x] Render graph at root
- [x] Add updated info box hover mode for dependers view
- [x] Fix top stats hovering and node force diagram interaction
  - Change the top stats to use the same highlight style as the all files filter
  - This will make it easy/understandable to switch between them
  - After that keeping the top stats list filtered by the file search should feel pretty intuitive
- [x] Selected node + hover over file tree: highlight the node hovered
- [x] Update info box for ancestors mode
- [x] Add the updated key
- [x] Add "Selected File" tab when in selected file mode
- [x] When in "Top Stats" mode: make all the top stats files highlighted
- [x] Parse `.dot` file in js without sending to server
- [x] Deploy to a server

Maybe:
- [ ] Have a setting to not highlight runtime dependencies?
- [ ] Create a "score" for the repository or the file
  - Based on the number of files that cause the top files to get recompiled
- [ ] Replace file-tree naming with selected file

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
- Show which compile-links cause the most files to be recompiled
  - How difficult is this to calculate? Hard, or rather expensive because this
    needs to be checked for ALL links, and for each link need to recalculate the
    stats for ALL nodes. Because we cannot just check the compile dependencies,
    need to check export and runtime deps as well (because a compile dep causes
    transitive dependencies with runtime deps)
- Integrate `mix compile --profile=time` output
- Add possibility for grouping or coloring based on boundary boundaries

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

## Other Notes

https://github.com/dagrejs/graphlib-dot/wiki#api

### Drawing directional arrows
Used a combination of:
* https://stackoverflow.com/questions/11121465/scaling-an-arrowhead-on-a-d3-force-layout-link-marker
* https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/marker-end

## FAQ

* Is this usable with other graphs?
  - A: Not really, for example the graph algorithms needs to revisit the starting node if the starting node is itself part of a transitive compile time dependency chain
