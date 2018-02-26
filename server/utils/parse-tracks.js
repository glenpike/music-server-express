export default function parseTracks(results) {
    const tracks = [];

    results.forEach(function(track) {
        const data = {
            id: track._id,
            path: track.path ? track.path : 'No path',
        };
        if (track.metadata) {
            if (track.metadata.artist) {
                data.artist = track.metadata.artist.join(',');
            }
            if (track.metadata.album) {
                data.album = track.metadata.album;
            }
            if (track.metadata.title) {
                data.title = track.metadata.title;
            } else {
                data.title = data.path.replace(/.*\/([^.]+)\..*$/gi, '$1');
            }
            if (track.metadata.track && track.metadata.track.no) {
                data.track = track.metadata.track.no;
            }
            if (track.metadata.disk && track.metadata.disk.no) {
                data.disk = track.metadata.disk.no;
            }
        }

        tracks.push(data);
    });
    return tracks;
}
