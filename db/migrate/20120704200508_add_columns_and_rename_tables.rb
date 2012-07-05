class AddColumnsAndRenameTables < ActiveRecord::Migration
  def change
    add_column :genres, :type, :integer
    add_column :genres, :super_genre_id, :integer
    rename_table :genres_direct_influences, :genres_stylistic_origins
    rename_column :genres_stylistic_origins, :direct_influence_id, :stylistic_origin_id
  end
end
