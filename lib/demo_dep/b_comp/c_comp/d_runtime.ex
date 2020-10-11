defmodule BComp.CComp.DRuntime do
  # touch
  def list, do: [42]

  def run do
    BComp.CComp.DRuntime.ERuntime.list()
  end
end
