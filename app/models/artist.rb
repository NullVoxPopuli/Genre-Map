class Artist < ActiveRecord::Base
  	attr_accessible :name, 
  					:website,
  					:wikipedia

  	has_many :tracks

  	validates_presence_of :name
end
