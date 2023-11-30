// eslint-disable-next-line
import { create } from "zustand";

const useStore = create( set => ( {
  comment: "",
  updateComment: newComment => set( { comment: newComment } )
} ) );

export default useStore;
