import { Platform } from 'react-native';
import RecordNative from './Record.native';
import RecordWeb from './Record.web';

export default function Record(props: any) {
  if (Platform.OS === 'web') {
    return <RecordWeb {...props} />;
  }
  return <RecordNative {...props} />;
}
