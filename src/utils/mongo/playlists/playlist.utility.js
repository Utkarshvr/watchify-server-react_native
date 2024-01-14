const Playlists = require("../../../models/Playlist");
const ApiError = require("../../classes/ApiError");

async function addVideoToPlaylistsUtil(video, playlists) {
  if (!video) throw new ApiError(400, "Video ID not specified");

  if (!playlists || playlists?.length === 0) {
    throw new ApiError(400, "Playlists are not given");
  }
  try {
    const playlistPromises = playlists?.map(async (playlistID) => {
      const givenPlaylist = await Playlists.findById(playlistID).lean();

      if (!givenPlaylist) {
        console.error(`Playlist with ID ${playlistID} not found.`);
        return null;
      }

      const isVideoAlreadySaved = givenPlaylist.videos.some(
        (vid) => vid?.toString() === video
      );

      if (isVideoAlreadySaved) {
        console.log(`Video already present in playlist with ID ${playlistID}.`);
        return null;
      }

      const updatedPlaylist = await Playlists.findByIdAndUpdate(
        playlistID,
        {
          $push: {
            videos: video,
          },
        },
        { new: true, runValidators: true }
      )
        // .populate("videos")
        .lean();

      return updatedPlaylist;
    });

    const updatedPlaylists = await Promise.all(playlistPromises);

    return updatedPlaylists;
  } catch (error) {
    throw new error();
  }
}

module.exports = { addVideoToPlaylistsUtil };
