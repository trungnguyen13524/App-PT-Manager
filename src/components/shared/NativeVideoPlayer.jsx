import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const NativeVideoPlayer = ({ sourceUri, style }) => {
  const player = useVideoPlayer(sourceUri, player => {
    player.loop = false;
  });

  return (
    <View style={[styles.container, style]}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});

export default NativeVideoPlayer;
