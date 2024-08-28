class DataValidations {
  /**
   * Função Reponsável por verificar se uma imagem está codificada na base 64
   * @param imageString
   * @returns
   */
  isBase64Image(imageString: string): boolean {
    const regex = /^data:image\/(jpeg|png|gif|bmp|webp);base64,/;

    if (!regex.test(imageString)) {
      return false;
    }

    const base64Data = imageString.replace(regex, '');
    const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

    return base64Regex.test(base64Data);
  }
}

const dataValidation = new DataValidations();

export { dataValidation };
