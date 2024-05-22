
class ExtensionClass {
  constructor() {
  }
}
const creator = (allAnimalParts, animalPart) => animalPart(allAnimalParts);
export const extender = (...parts) => parts.reduce(creator, ExtensionClass);