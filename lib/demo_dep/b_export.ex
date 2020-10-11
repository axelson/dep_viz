defmodule BExport do
  import BExport.CExport
  def export, do: 43

  # touch
  def run do
    clist()
  end

  @comp BExport.CComp.list()
  def comp, do: @comp

  def runtime do
    BExport.CRuntime.list()
  end
end
