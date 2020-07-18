import numpy as np
import io
import soundfile as sf


def syncToVideo(video, audio):
    """
    :arg video is the wav from the video
    :arg audio is the enhanced audio
    :returns (video_offset, audio_offset), the values for syncing the two videos
    """

    # step 1 -> extract numpy arrays from the two audio
    video_data, video_samplerate = sf.read(io.BytesIO(video))
    # print(video_data, video_data.shape[0], video_samplerate, flush=True)
    audio_data, audio_samplerate = sf.read(io.BytesIO(audio))
    # print(audio_data, audio_data.shape[0], audio_samplerate, flush=True)

    # step 2
    # overlay the two audio by using the window between them
    # we approximate the results with 4 frames per second

    def scale_signal(signal):
        new_signal = np.copy(signal)
        m, M = np.min(new_signal), np.max(new_signal)
        new_signal = new_signal / (M - m)
        return new_signal

    signal1 = scale_signal(video_data)
    signal2 = scale_signal(audio_data)

    max_window = int(np.abs(video_data.shape[0] - audio_data.shape[0]) * 1.618)
    print(max_window, flush=True)

    # we scale down to 10 samples per second
    down_factor = audio_samplerate // 10
    max_window //= down_factor
    scaled1 = scale_signal(
        np.array([
            np.mean(signal1[i:i+down_factor, 0]) for i in range(0, signal1.shape[0] // down_factor * down_factor, down_factor)
        ])
    )
    scaled2 = scale_signal(
        np.array([
            np.mean(signal2[i:i + down_factor, 0]) for i in range(0, signal2.shape[0] // down_factor * down_factor, down_factor)
        ])
    )

    np.save('scaled1.npy', scaled1)
    np.save('scaled2.npy', scaled2)

    offset1 = np.zeros(max_window)
    offset2 = np.zeros(max_window)

    min_shape = min(scaled1.shape[0], scaled2.shape[0])
    # offset for 1:
    for offset in range(max_window):
        for i in range(min_shape - max_window - 1):
            offset1[offset] += np.sum(np.abs(scaled1[i + offset] - scaled2[i]))
        print(f'{offset} out of {max_window - 1} -> ', offset1[offset])

    # offset for 2:
    for offset in range(max_window):
        for i in range(min_shape - max_window - 1):
            offset2[offset] += np.sum(np.abs(scaled1[i] - scaled2[i + offset]))
        print(f'{offset} out of {max_window - 1} -> ', offset2[offset])

    print(np.min(offset1), np.min(offset2), flush=True)
    video_offset, audio_offset = 0, 0
    for i, offset in enumerate(offset1):
        if offset < offset1[video_offset]:
            video_offset = i
    for i, offset in enumerate(offset2):
        if offset < offset2[audio_offset]:
            audio_offset = i

    np.save('offset1.npy', offset1)
    np.save('offset2.npy', offset2)

    return video_offset, audio_offset
