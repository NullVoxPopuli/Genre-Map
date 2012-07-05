class ChangeGenreTypeToGenreKind < ActiveRecord::Migration
  def up
  	    rename_column :genres, :type, :kind
  end

  def down
  	    rename_column :genres, :kind, :type
  end
end
