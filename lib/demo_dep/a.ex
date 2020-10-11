defmodule A do
  import BExport

  def run do
    export()
  end

  @comp BComp.list()
  def comp, do: @comp

  def runtime do
    BRuntime.call()
  end
end
