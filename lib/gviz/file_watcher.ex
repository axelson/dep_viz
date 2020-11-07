defmodule GViz.FileWatcher do
  use GenServer
  require Logger

  defmodule State do
    defstruct [:watcher_pid]
  end

  def start_link(opts \\ []) do
    GenServer.start_link(__MODULE__, opts)
  end

  @impl GenServer
  def init(_opts) do
    dirs = [Path.join(:code.priv_dir(:gviz), ["sample_xref"])]
    {:ok, watcher_pid} = FileSystem.start_link(dirs: dirs)
    FileSystem.subscribe(watcher_pid)

    state = %State{watcher_pid: watcher_pid}

    {:ok, state}
  end

  @impl GenServer
  def handle_info({:file_event, watcher_pid, {path, events}}, %{watcher_pid: watcher_pid} = state) do
    IO.puts("new file!")
    IO.inspect(path, label: "path")
    IO.inspect(events, label: "events")
    phoenix_endpoint().broadcast("phoenix:live_reload", "assets_change", %{asset_type: "eex"})
    {:noreply, state}
  end

  def handle_info(msg, state) do
    Logger.debug("Unhandled message: #{inspect msg}")
    {:noreply, state}
  end

  defp phoenix_endpoint, do: Application.fetch_env!(:gviz, :phoenix_endpoint)
end
