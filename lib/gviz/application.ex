defmodule GViz.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    GViz.Configuration.preload(GVizWeb.Endpoint)

    children = [
      # Start the Telemetry supervisor
      GVizWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: GViz.PubSub},
      # Start the Endpoint (http/https)
      # GVizWeb.Endpoint
      {SiteEncrypt.Phoenix, GVizWeb.Endpoint}
      # {GViz.FileWatcher, []}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: GViz.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    GVizWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
