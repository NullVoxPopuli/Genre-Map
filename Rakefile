#!/usr/bin/env rake
# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require File.expand_path('../config/application', __FILE__)

GenreMap::Application.load_tasks

namespace :db  do
  	task :recreate => :environment do
  		Rake::Task["db:drop"].invoke
  		Rake::Task["db:create"].invoke
  		Rake::Task["db:migrate"].invoke
  	end
end