import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blakelamb.board_game_selector',
  appName: 'Board Game Selector',
  webDir: 'dist/board-game-selector',
  server: {
    androidScheme: 'https'
  }
};

export default config;
