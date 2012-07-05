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

ActiveRecord::Schema.define(:version => 20120704200508) do

  create_table "artists", :force => true do |t|
    t.string "name"
    t.string "website"
    t.string "wikipedia"
  end

  create_table "genres", :force => true do |t|
    t.string  "name"
    t.string  "aka"
    t.text    "description"
    t.date    "time_of_inception"
    t.string  "cultural_origins"
    t.string  "wikipedia"
    t.integer "type"
    t.integer "super_genre_id"
  end

  create_table "genres_partial_influences", :id => false, :force => true do |t|
    t.integer "genre_id"
    t.integer "partial_influence_id"
  end

# Could not dump table "genres_stylstic_origins" because of following StandardError
#   Unknown type 'stylistic_origin_id' for column 'direct_influence_id'

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

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "provider"
    t.string   "uid"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

end
