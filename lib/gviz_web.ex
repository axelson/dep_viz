defmodule GVizWeb do
  @moduledoc """
  The entrypoint for defining your web interface, such
  as controllers, views, channels and so on.

  This can be used in your application as:

      use GVizWeb, :controller
      use GVizWeb, :view

  The definitions below will be executed for every view,
  controller, etc, so keep them short and clean, focused
  on imports, uses and aliases.

  Do NOT define functions inside the quoted expressions
  below. Instead, define any helper function in modules
  and import those modules here.
  """

  def controller do
    quote do
      use Phoenix.Controller, namespace: GVizWeb
      use Gettext, backend: GVizWeb.Gettext

      import Plug.Conn
      alias GVizWeb.Router.Helpers, as: Routes
    end
  end

  def view do
    quote do
      use Phoenix.View,
        root: "lib/gviz_web/templates",
        namespace: GVizWeb

      # Import convenience functions from controllers
      import Phoenix.Controller,
        only: [view_module: 1, view_template: 1]

      # Include shared imports and aliases for views
      unquote(view_helpers())
    end
  end

  def live_view do
    quote do
      use Phoenix.LiveView,
        layout: {GVizWeb.LayoutView, :live}

      unquote(view_helpers())
    end
  end

  def live_component do
    quote do
      use Phoenix.LiveComponent

      unquote(view_helpers())
    end
  end

  def router do
    quote do
      use Phoenix.Router

      import Plug.Conn
      import Phoenix.Controller
      import Phoenix.LiveView.Router
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
      use Gettext, backend: GVizWeb.Gettext
    end
  end

  defp view_helpers do
    quote do
      use Gettext, backend: GVizWeb.Gettext

      # Import LiveView helpers (live_render, live_component, live_patch, etc)
      import Phoenix.Component

      # Import basic rendering functionality (render, render_layout, etc)
      import Phoenix.View

      alias GVizWeb.Router.Helpers, as: Routes
    end
  end

  @doc """
  When used, dispatch to the appropriate controller/view/etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
