defmodule A do
  import BExport

  @c Loop.list()

  defmacro mac do
    quote do
      IO.puts(42)
    end
  end

  def run do
    IO.inspect(@c, label: "@c")
    export()
  end

  @comp BComp.list()
  def comp, do: @comp

  def runtime do
    BRuntime.call()
  end
end
