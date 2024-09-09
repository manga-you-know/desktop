export default defineEventHandler(() => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'fidasse',
    }),
  };
}); 