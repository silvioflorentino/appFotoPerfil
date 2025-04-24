import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function App() {
  const [imageUrl, setImageUrl] = useState(null);

  const pedirPermissao = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'É preciso permitir acesso à galeria.');
      return false;
    }
    return true;
  };

  const pickImageAndUpload = async () => {
    const temPermissao = await pedirPermissao();
    if (!temPermissao) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Correto aqui
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) {
        Alert.alert('Cancelado', 'Seleção de imagem cancelada.');
        return;
      }

      const imageUri = result.assets[0].uri;
      console.log('Imagem selecionada:', imageUri);

      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });
      formData.append('upload_preset', 'preset_publico');

      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dgsffmd9f/image/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('Upload feito:', response.data);
      setImageUrl(response.data.secure_url);
    } catch (error) {
      console.error('Erro no upload:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível fazer o upload da imagem.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Escolher e Enviar Foto" onPress={pickImageAndUpload} />
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    marginTop: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#444',
  },
});
