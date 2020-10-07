defmodule GViz do
  def sample_dot_file do
    sample_dot_path = Path.join(:code.priv_dir(:gviz), "sample_xref_graph.dot")
    File.read!(sample_dot_path)
  end

  def force_layout do
    with {:ok, decoded} <- Dotx.decode(sample_dot_file()) do
      decoded
      # build a csv representing each node and edge
    end
  end
end
