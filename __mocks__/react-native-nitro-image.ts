// The real module creates a native hybrid object on import, which fails in Jest.
// Every edit returns the same image; override loadFromFileAsync to check that each
// edit builds on the last
interface MockImage {
  rotateAsync: ( ) => Promise<MockImage>;
  cropAsync: ( ) => Promise<MockImage>;
  saveToFileAsync: ( ) => Promise<void>;
}

const mockImage: MockImage = {
  rotateAsync: jest.fn( async ( ) => mockImage ),
  cropAsync: jest.fn( async ( ) => mockImage ),
  saveToFileAsync: jest.fn( async ( ) => undefined ),
};

// eslint-disable-next-line import/prefer-default-export
export const Images = {
  loadFromFileAsync: jest.fn( async ( ) => mockImage ),
};
