const comments = [
  {
    _id: "6598203ea488d83cfd937ad2",
    isReply: false,
    video: "6597ecdb3dc5600f638e1bc9",
    commenter: "6559fd97076e8f3934fee0e1",
    content: "Nice Video",
    createdAt: "2024-01-05T15:29:02.474Z",
    updatedAt: "2024-01-05T15:29:02.474Z",
    __v: 0,
  },
  {
    _id: "65982139fb58bd7046a07df6",
    isReply: true,
    video: "6597ecdb3dc5600f638e1bc9",
    commenter: "655a00629574d11be96ede10",
    content: "There's nothing nice in the video",
    parentComment: "6598203ea488d83cfd937ad2",
    createdAt: "2024-01-05T15:33:13.098Z",
    updatedAt: "2024-01-05T15:33:13.098Z",
    __v: 0,
  },
  {
    _id: "659821dcfb58bd7046a07dfc",
    isReply: true,
    video: "6597ecdb3dc5600f638e1bc9",
    commenter: "6559fd97076e8f3934fee0e1",
    content: "Didn't ask for ur opinion, though😒",
    parentComment: "65982139fb58bd7046a07df6",
    createdAt: "2024-01-05T15:35:56.133Z",
    updatedAt: "2024-01-05T15:35:56.133Z",
    __v: 0,
  },
  {
    _id: "6598224dfb58bd7046a07e02",
    isReply: true,
    video: "6597ecdb3dc5600f638e1bc9",
    commenter: "6594fd21de00bf79d98688fc",
    content: "Not even close to Nice 🥱",
    parentComment: "6598203ea488d83cfd937ad2",
    createdAt: "2024-01-05T15:37:49.092Z",
    updatedAt: "2024-01-05T15:37:49.092Z",
    __v: 0,
  },
];

const formatComments = comments
  ?.map((comment) => {
    const replies = comments.filter(
      (com) =>
        com.isReply &&
        comment._id?.toString() === com.parentComment?._id?.toString()
    );
    console.log(replies);

    if (replies.length > 0) return { ...comment, replies };

    if (!comment.isReply) return comment;
  })
  .filter(Boolean);
// const formattedComments = formatComments(comments);
console.log(formatComments);

// const formatComments = [
//   {
//     _id: "6598203ea488d83cfd937ad2",
//     isReply: false,
//     video: "6597ecdb3dc5600f638e1bc9",
//     commenter: "6559fd97076e8f3934fee0e1",
//     content: "Nice Video",
//     createdAt: "2024-01-05T15:29:02.474Z",
//     updatedAt: "2024-01-05T15:29:02.474Z",
//     __v: 0,
//     replies: [
//       {
//         _id: "65982139fb58bd7046a07df6",
//         isReply: true,
//         video: "6597ecdb3dc5600f638e1bc9",
//         commenter: "655a00629574d11be96ede10",
//         content: "There's nothing nice in the video",
//         parentComment: "6598203ea488d83cfd937ad2",
//         createdAt: "2024-01-05T15:33:13.098Z",
//         updatedAt: "2024-01-05T15:33:13.098Z",
//         __v: 0,
//         replies: [
//           {
//             _id: "659821dcfb58bd7046a07dfc",
//             isReply: true,
//             video: "6597ecdb3dc5600f638e1bc9",
//             commenter: "6559fd97076e8f3934fee0e1",
//             content: "Didn't ask for ur opinion, though😒",
//             parentComment: "65982139fb58bd7046a07df6",
//             createdAt: "2024-01-05T15:35:56.133Z",
//             updatedAt: "2024-01-05T15:35:56.133Z",
//             __v: 0,
//           },
//         ],
//       },
//       {
//         _id: "6598224dfb58bd7046a07e02",
//         isReply: true,
//         video: "6597ecdb3dc5600f638e1bc9",
//         commenter: "6594fd21de00bf79d98688fc",
//         content: "Not even close to Nice 🥱",
//         parentComment: "6598203ea488d83cfd937ad2",
//         createdAt: "2024-01-05T15:37:49.092Z",
//         updatedAt: "2024-01-05T15:37:49.092Z",
//         __v: 0,
//       },
//     ],
//   },
// ];
