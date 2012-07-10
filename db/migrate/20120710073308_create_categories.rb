class CreateCategories < ActiveRecord::Migration
  def up
    create_table :categories do |t|
      t.string :name
    end
    add_column :genres, :category_id, :integer
  end

  def down
  	drop_table :categories
  	remove_column :genres, :category_id
  end
end
