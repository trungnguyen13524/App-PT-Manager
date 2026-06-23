import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useMissionStore } from '../../store/missionStore';
import { Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const GlobalRewardToast = () => {
  const { rewardPopup } = useMissionStore();
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (rewardPopup.visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 60,
          damping: 14,
          stiffness: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [rewardPopup.visible]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          transform: [{ translateY }],
          opacity 
        }
      ]} 
      pointerEvents="none"
    >
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Sparkles color="#FFD700" size={24} fill="#FFD700" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{rewardPopup.title || 'Nhiệm vụ hoàn thành'}</Text>
            <Text style={styles.points}>+{rewardPopup.points} XP</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99999,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    width: width * 0.85,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  points: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
  },
});

export default GlobalRewardToast;
