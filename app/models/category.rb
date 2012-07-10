class Category < ActiveRecord::Base
  attr_accessible :name
  belongs_to :genre
end
