# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120702005941) do

  create_table "artists", :force => true do |t|
    t.string "name"
    t.string "website"
    t.string "wikipedia"
  end

  create_table "genres", :force => true do |t|
    t.string "name"
    t.string "aka"
    t.text   "description"
    t.date   "time_of_inception"
    t.string "cultural_origins"
    t.string "wikipedia"
  end

  create_table "genres_direct_influences", :id => false, :force => true do |t|
    t.integer "genre_id"
    t.integer "direct_influence_id"
  end

  add_index "genres_direct_influences", ["direct_influence_id", "genre_id"], :name => "direct_influence_genre_index"
  add_index "genres_direct_influences", ["genre_id", "direct_influence_id"], :name => "direct_inflence_index"

  create_table "genres_partial_influences", :id => false, :force => true do |t|
    t.integer "genre_id"
    t.integer "partial_influence_id"
  end

  add_index "genres_partial_influences", ["genre_id", "partial_influence_id"], :name => "genre_partial_influence_index"
  add_index "genres_partial_influences", ["partial_influence_id", "genre_id"], :name => "partial_influence_genre_index"

  create_table "genres_tracks", :id => false, :force => true do |t|
    t.integer "genre_id"
    t.integer "track_id"
  end

  add_index "genres_tracks", ["genre_id", "track_id"], :name => "index_genres_tracks_on_genre_id_and_track_id"
  add_index "genres_tracks", ["track_id", "genre_id"], :name => "index_genres_tracks_on_track_id_and_genre_id"

  create_table "tracks", :force => true do |t|
    t.string  "name"
    t.integer "artist_id"
    t.string  "link"
  end

end
