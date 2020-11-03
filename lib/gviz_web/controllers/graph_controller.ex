defmodule GVizWeb.GraphController do
  use GVizWeb, :controller
  require Logger
  alias NimbleCSV.RFC4180, as: CSV

  def readme(conn, _params) do
    text(conn, File.read!("README.md"))
  end

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def force(conn, _params) do
    # {width, height} = {800, 600}
    {width, height} = {1000, 800}
    # {width, height} = {1200, 1000}
    # {width, height} = {2000, 1300}
    render(conn, "force_layout.html", svg_width: width, svg_height: height)
  end

  def force_data(conn, _params) do
    sample_dot = File.read!(sample_dot_path())
    graph = Dotx.decode!(sample_dot)
    headers = ["type", "id", "source", "target", "label"]

    rows =
      graph.children
      |> Enum.flat_map(fn
        %Dotx.Node{id: id} ->
          [["node", id, nil, nil, nil]]

        %Dotx.Edge{from: from, to: to} = edge ->
          [
            ["edge", nil, from.id, to.id, label(edge)],
            ["node", from.id, nil, nil, nil],
            ["node", to.id, nil, nil, nil]
          ]

        element ->
          Logger.debug("ignoring node #{inspect(element)}")
          []
      end)
      |> Enum.uniq()

    csv = CSV.dump_to_iodata([headers | rows])

    text(conn, csv)
  end

  defp label(%Dotx.Edge{attrs: %{"label" => label}}), do: label
  defp label(%Dotx.Edge{}), do: ''

  def dot(conn, _params) do
    sample_dot = File.read!(sample_dot_path())

    text(conn, sample_dot)
  end

  defp sample_dot_path do
    Path.join(:code.priv_dir(:gviz), ["sample_xref/", "tiny.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "short.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "gviz_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "simple_sample_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "sample_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "sample_loop_xref_graph.dot"])

    # Applications
    # before
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "thechangelog_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "thechangelog_xref_graph_my_fix.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "thechangelog_xref_graph_before.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "thechangelog_xref_graph_after.dot"])

    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "hexpm_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "adoptoss_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "ash_example_xref_graph.dot"])

    # Libraries and Tools
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "jason_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "membrane_core_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "phoenix_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "plausible_analytics_xref_graph.dot"])
    # Good example of subsystems
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "scenic_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "contex_xref_graph.dot"])

    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "credo_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "credo_after_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "credo_after2_xref_graph.dot"])

    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "absinthe_xref_graph.dot"])

    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "blue_heron_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "cachex_xref_graph.dot"])
    # Path.join(:code.priv_dir(:gviz), ["sample_xref/", "language_server_xref_graph.dot"])
  end
end
