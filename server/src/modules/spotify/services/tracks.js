import redis from '../../../shared/redis';
import stringsMatch from '../../../shared/stringsMatch';
import spotify from './search';
import artistsService from '../services/artists';

export default {
  get,
  getAll,
  getByArtist,
  mapTrack
};

async function get(track, artist, ignoreCache) {
  try {
    if (!ignoreCache) {
      let cachedArtist = await artistsService.search(artist);

      if (cachedArtist && cachedArtist[track]) {
        console.log('CACHED: Track => ', track);
        return Promise.resolve(mapTrack(track, cachedArtist[track]));
      }
    }

    const { tracks } = await spotify.search('tracks', { track, artist });

    let matchedTrack = tracks.items.find(item => {
      const { name, artists } = item;
      const isMatch = stringsMatch(name, track);

      return isMatch && artist ? hasArtist(artist, artists) : isMatch;
    });

    redis.set(artist, mapTrack(track, matchedTrack.id));

    return Promise.resolve(mapTrack(track, matchedTrack.id));
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getAll(tracks, artistName) {
  try {
    const requests = tracks.map(track => get(track, artistName));

    let resps = await Promise.all(requests);

    console.log(resps);

    resps = resps.reduce((tracks, track) => {
      return Object.assign(tracks, track);
    }, {});

    return Promise.resolve(resps);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function getByArtist(artistName, id) {
  try {
    let artist;

    if (!id) {
      artist = await redis.get(artistName);

      if (!artist) {
        artist = await artistsService.search(artistName);
      }
    }

    if (artist.tracks) {
      return Promise.resolve(artist.tracks);
    }

    const { tracks } = await getArtistTracksById(id || artist._id);

    const mappedTracks = tracks.reduce((tracks, track) => {
      tracks[track.name] = track.id;
      return tracks;
    }, {});

    redis.set(artistName, {
      _id: id || artist._id,
      tracks: mappedTracks
    });

    return Promise.resolve(mappedTracks);
  } catch (error) {
    return Promise.reject(error);
  }
}

function mapTrack(name, id) {
  let track = {};
  track[name] = id;
  return track;
}

function getArtistTracksById(id) {
  return spotify.get(`/artists/${id}/top-tracks`, { country: 'US' });
}

function hasArtist(artistName, artists) {
  return artists.some(artist => stringsMatch(artist.name, artistName));
}
