import { useNavigation, useRoute } from "@react-navigation/native";
import {
  ViewWrapper,
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { TabStackScreenProps } from "navigation/types";
import React, {
  useEffect,
  useMemo,
} from "react";
import {
  useTranslation,
} from "sharedHooks";

// import fetchUserPosts from "api/posts";
// import ActivityIndicator from "components/SharedComponents/ActivityIndicator";
// import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
// import useCurrentUser from "sharedHooks/useCurrentUser";
import PostList from "./PostList";

const Journal = ( ) => {
  const navigation = useNavigation<TabStackScreenProps<"Journal">["navigation"]>( );
  const { params } = useRoute<TabStackScreenProps<"Journal">["route"]>( );
  const { journalPostsCount, projectTitle, userLogin } = params || {};
  const { t } = useTranslation( );

  const headerOptions = useMemo(
    () => ( {
      headerTitle: userLogin || projectTitle || t( "Blog" ),
      headerSubtitle: t( "X-JOURNAL_POSTS", {
        count: journalPostsCount || 0,
      } ),
    } ),
    [journalPostsCount, t, userLogin, projectTitle],
  );

  useEffect( ( ) => {
    navigation.setOptions( headerOptions );
  }, [headerOptions, navigation] );

  // https://linear.app/inaturalist/issue/MOB-1424/fetch-live-posts
  // const currentUser = useCurrentUser( );
  // const { data: posts, isLoading: isLoadingPosts } = useAuthenticatedQuery(
  //   ["fetchUserPosts"],
  //   optsWithAuth => fetchUserPosts(
  //     {},
  //     optsWithAuth,
  //   ),
  //   { enabled: !!currentUser },
  // );

  const posts = [{
    body: "<p>Many thanks to everyone who joined us for the third in our series of iNaturalist identification tutorials!</p>\n\n<p><br></p>\n\n<p align=\"center\"><iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/mKY800hf6wE?si=6XfJ6DLMooQVGRD-\" title=\"YouTube video player\" frameborder=\"0\"></iframe></p>\n\n<p><br></p>\n\n<p style=\"text-align: center;display:block;\"><a class=\"donation-button\" style=\"background: #74AC00;color: #fff;text-decoration: none;display: inline-block;font-size: 16px;padding: 15px 38px;-webkit-border-radius: 30px;-moz-border-radius: 30px;border-radius: 30px;font-weight: 600; box-shadow: 0px 2px 4px #888;\" href=\"https://docs.google.com/presentation/d/1G7VBUflGeRrc9MVM8KB9yWEngGj9k_9Tb-_eBcN9V7k/edit?slide=id.g3e6f95ca140_0_27#slide=id.g3e6f95ca140_0_27\" rel=\"nofollow noopener\">View the Slides</a></p>\n\n<p><br></p>\n\n<p>These webinars are designed for those unfamiliar with identifying on iNaturalist, but even an experienced identifier may learn something new! Here's <a href=\"https://www.inaturalist.org/blog/119680-identifying-on-inaturalist-how-you-can-help\" rel=\"nofollow noopener\">part one</a> and <a href=\"https://www.inaturalist.org/blog/126406-identifying-on-inaturalist-getting-started-with-plants\" rel=\"nofollow noopener\">part two</a> in case you missed them.</p>\n\n<p><br></p>\n\n<h3>Here's a quick recap of what you'll learn about in the webinar recording:</h3>\n\n<h4>\n<ol>\n  <li style=\"margin-bottom: 20px; margin-top: 20px\">How to contribute identifications even if you’re not an expert\n</li>\n\n  <li style=\"margin-bottom: 20px;\">Basic arthropod identification information (like how to tell insects apart from arachnids, or centipedes from millipedes) </li>\n\n  <li style=\"margin-bottom: 20px;\">Tips and tricks for using the iNaturalist website’s Identify page (including using the Suggestions tab to check your work, finding observations that have disagreements, and more) </li>\n</ol>\n</h4>\n\n<p style=\"text-align: center;display:block;\"><a class=\"donation-button\" style=\"background: #74AC00;color: #fff;text-decoration: none;display: inline-block;font-size: 16px;padding: 15px 38px;-webkit-border-radius: 30px;-moz-border-radius: 30px;border-radius: 30px;text-shadow: 0 1px rgba(0, 0, 0, 0.3); font-weight: 600; box-shadow: 0px 2px 4px #888;\" href=\"https://www.youtube.com/watch?v=mKY800hf6wE\" rel=\"nofollow noopener\">Watch the Webinar</a></p>\n\n<p><br></p>\n\n<h3>Start identifying today!</h3>\n\n<p>Think of every identification you add as passing a baton — even a broad ID like \"Insects” or “Arachnids” moves an observation closer to the right expert and helps it get seen. Rather than doomscrolling on social media, you can positively contribute to improving our knowledge about biodiversity!\n</p>\n\n<p><b>Ready to get started?</b> Take a look at some of the <a href=\"https://www.inaturalist.org/observations/identify?lrank=phylum&amp;hrank=phylum&amp;taxon_id=47120\" rel=\"nofollow noopener\">\"stuck\" arthropods that need a little help moving through the identification process</a>.</p>\n\n<p><br><br></p>\n\n<h3>Looking for more ways to stay connected?</h3>\n\n<ul>\n  <li style=\"margin-bottom: 12px;\">\n<a href=\"https://www.inaturalist.org/pages/citynaturechallenge#identify\" rel=\"nofollow noopener\">Practice your identification skills</a> by sorting observations made during the City Nature Challenge!</li>\n  <li style=\"margin-bottom: 12px;\">Sign up for our free monthly newsletter, <i><a href=\"https://www.inaturalist.org/pages/newsletter\" rel=\"nofollow noopener\">The Nature Notice</a></i>, where we share new science, community highlights, and ways to stay connected every month.</li>\n  <li style=\"margin-bottom: 12px;\">For a more general intro to iNaturalist, <a href=\"https://us06web.zoom.us/webinar/register/WN_KMKOKc5WTMaQ8-NqxzCtcw#/registration\" rel=\"nofollow noopener\">sign up for our next webinar on May 15</a>.</li>\n  <li style=\"margin-bottom: 12px;\">\n<a href=\"https://www.inaturalist.org/projects/idb-2026-acting-locally-for-global-impact\" rel=\"nofollow noopener\">Join the project for the International Day of Biodiversity</a> and make observations from May 15–31 to celebrate!</li>\n</ul>\n\n<p><br></p>\n\n<h3>Dive deeper</h3>\n\n<ul style=\"display: grid; grid-template-columns: 1fr 1fr; padding-left: 0; margin: 0; gap: 0;\">\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://www.inaturalist.org/observations/304870193\" rel=\"nofollow noopener\">The spider observation that led to a new species description</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://www.nytimes.com/2026/03/20/science/spider-cordyceps-fungus-zombies.html?unlocked_article_code=1.flA.4ZUd.7Z5XCE6i6vCE&amp;smid=nytcore-ios-share\" rel=\"nofollow noopener\">New York Times article about the new fungus-mimicking spider</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://neobiota.pensoft.net/article/154246/\" rel=\"nofollow noopener\">How scientists are using spotted lanternfly observations</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://www.inaturalist.org/blog/119680-identifying-on-inaturalist-how-you-can-help\" rel=\"nofollow noopener\">Identifying on iNaturalist: Part 1</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://www.inaturalist.org/blog/126406-identifying-on-inaturalist-getting-started-with-plants\" rel=\"nofollow noopener\">Identifying on iNaturalist: Plants (Part 2)</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://help.inaturalist.org/support/solutions/articles/151000194901\" rel=\"nofollow noopener\">How Identifications Work</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://help.inaturalist.org/support/solutions/articles/151000170242\" rel=\"nofollow noopener\">When to Agree with an Identification</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://help.inaturalist.org/en/support/solutions/articles/151000224712\" rel=\"nofollow noopener\">How to withdraw an Identification</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://help.inaturalist.org/en/support/solutions/articles/151000170245\" rel=\"nofollow noopener\">Why do people keep adding \"obvious\" IDs like \"Plants\" or \"Fungi\"?</a></li>\n  <li style=\"margin-bottom: 12px; margin-left: 1.25em;\"><a href=\"https://www.inaturalist.org/observation_accuracy_experiments/4?tab=research_grade_results\" rel=\"nofollow noopener\">Our team's research on the accuracy of identifications on iNaturalist</a></li>\n</ul>\n\n<p><br></p>\n\n<p align=\"center\"><a href=\"https://www.youtube.com/watch?v=mKY800hf6wE\" rel=\"nofollow noopener\"><img src=\"https://static.inaturalist.org/wiki_page_attachments/5210-original.png\" width=\"80%\"></a></p>\n\n<p><br></p>",
    created_at: "2026-05-04T18:28:52.497Z",
    distance: null,
    id: 130003,
    latitude: null,
    longitude: null,
    number: null,
    parent: { id: 1, name: "iNaturalist", icon_url: "https://static.inaturalist.org/sites/1-logo_square.png?1573071870" },
    parent_id: 1,
    parent_type: "Site",
    place_id: null,
    published_at: "2026-05-04T22:47:15.339Z",
    radius: null,
    start_time: null,
    stop_time: null,
    title: "Identifying on iNaturalist: Getting Started with Arthropods",
    updated_at: "2026-05-04T22:47:15.349Z",
    user: {
      id: 439749, login: "seastarya", user_icon_url: "https://static.inaturalist.org/attachments/users/icons/439749/fe479954e0559346e250c69652fb021f-thumb.jpg?1775781696", medium_user_icon_url: "https://static.inaturalist.org/attachments/users/icons/439749/fe479954e0559346e250c69652fb021f-medium.jpg?1775781696",
    },
    user_id: 439749,
    uuid: "1ad56e08-e930-400b-a8b9-3346780f64f7",
  }];

  // if ( isLoadingPosts ) {
  //   return (
  //     <View className="flex-1 bg-white">
  //       <ActivityIndicator size={50} />
  //     </View>
  //   );
  // }

  return (
    <ViewWrapper useTopInset={false}>
      <View className="border-b border-lightGray mt-5" />
      <PostList posts={posts} />
    </ViewWrapper>
  );
};

export default Journal;
