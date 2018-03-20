const status = {
    TRACK_EXISTS: 'TRACK_EXISTS',
    TRACK_NOT_FOUND: 'TRACK_NOT_FOUND',
    TRACK_CREATE_ERROR: 'TRACK_CREATE_ERROR',
    TRACK_UPDATE_ERROR: 'TRACK_UPDATE_ERROR',
    TRACK_DELETE_ERROR: 'TRACK_DELETE_ERROR',
    TRACK_READ_ERROR: 'TRACK_READ_ERROR',
    TRACK_LIST_ERROR: 'TRACK_LIST_ERROR',
};

export default {
    status,
    errorMessages: (code) =>
        status[code]
            ? { status: 'error', message: status[code] }
            : { status: 'error', message: 'Unknown Error' },
};
