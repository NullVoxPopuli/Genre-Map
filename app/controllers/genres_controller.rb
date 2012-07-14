class GenresController < ApplicationController
  before_filter :authenticate_user!
  # GET /genres
  # GET /genres.json
  def index
    @genres = Genre.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @genres }
    end
  end

  # GET /genres/1
  # GET /genres/1.json
  def show
    @genre = Genre.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @genre }
    end
  end

  # GET /genres/new
  # GET /genres/new.json
  def new
    @genre = Genre.new
    @genres = Genre.all

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @genre }
    end
  end

  # GET /genres/1/edit
  def edit
    @genre = Genre.find(params[:id])
    @genres = Genre.all

    @current_origins = @genre.stylistic_origins
    @available_origins =  Genre.all - @current_origins

    @current_tracks = @genre.tracks
    @available_tracks = Track.all - @current_tracks

    @current_children = @genre.childs
    @available_children = Genre.all - @current_children
  end

  # POST /genres
  # POST /genres.json
  def create
    @genre = Genre.new(params[:genre])
    respond_to do |format|
      if @genre.save
        format.html { redirect_to @genre, notice: 'Genre was successfully created.' }
        format.json { render json: @genre, status: :created, location: @genre }
      else
        format.html { render action: "new" }
        format.json { render json: @genre.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /genres/1
  # PUT /genres/1.json
  def update
    @genre = Genre.find(params[:id])
    params[:genre][:time_of_inception] = 
      Date.strptime(params[:genre][:time_of_inception], "%Y") if params[:genre][:time_of_inception]

    respond_to do |format|
      if @genre.update_attributes(params[:genre])
        format.html { redirect_to @genre, notice: 'Genre was successfully updated.' }
        format.json { head :no_content }
      else
        @genres = Genre.all

        @current_origins = @genre.stylistic_origins
        @available_origins =  Genre.all - @current_origins

        @current_tracks = @genre.tracks
        @available_tracks = Track.all - @current_tracks

        @current_children = @genre.childs
        @available_children = Genre.all - @current_children

        format.html { render action: "edit" }
        format.json { render json: @genre.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /genres/1
  # DELETE /genres/1.json
  def destroy
    @genre = Genre.find(params[:id])
    @genre.destroy

    respond_to do |format|
      format.html { redirect_to genres_url }
      format.json { head :no_content }
    end
  end


  def update_tracks
    # updates songs based on artist selected
    @genre = Genre.find(params[:id])
    track = Track.find(params[:track_id].to_i)
    update = params[:update]

    if update == "add"
      @genre.tracks << track
    else update == "remove"
      @genre.tracks.delete(track)
    end
    @genre.save

    if @genre.errors.size > 0
      flash[:notice] = "Something Bad Happened"
      redirect_to edit_genre_path(@genre)
    else
      render :nothing => true
    end
  end

  def update_origin_genres
    # updates songs based on artist selected
    @genre = Genre.find(params[:id])
    origin = Genre.find(params[:origin_genre_id].to_i)
    update = params[:update]

    if update == "add"
      @genre.stylistic_origins << origin
    else update == "remove"
      @genre.stylistic_origins.delete(origin)
    end
    @genre.save

    if @genre.errors.size > 0
      flash[:notice] = "Something Bad Happened"
      redirect_to edit_genre_path(@genre)
    else
      render :nothing => true
    end
  end

    def update_children
    # updates songs based on artist selected
    @genre = Genre.find(params[:id])
    child = Genre.find(params[:child_id].to_i)
    update = params[:update]

    if update == "add"
      @genre.childs << child
    else update == "remove"
      @genre.childs.delete(child)
    end
    @genre.save

    if @genre.errors.size > 0
      flash[:notice] = "Something Bad Happened"
      redirect_to edit_genre_path(@genre)
    else
      render :nothing => true
    end
  end

end
