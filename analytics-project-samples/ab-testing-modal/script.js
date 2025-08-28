(function($){
  const $modal = $('#video-modal');
  const $close = $('.modal__close');

  function track(eventName, payload) {
    // Example analytics hook (replace with dataLayer.push or gtag as needed)
    // dataLayer.push({ event: eventName, ...payload });
    console.log('track:', eventName, payload || {});
  }

  function openModal(){
    $modal.addClass('modal--open').attr('aria-hidden', 'false');
    track('modal_open', { component: 'video_hero' });
  }

  function closeModal(){
    $modal.removeClass('modal--open').attr('aria-hidden', 'true');
    track('modal_close', { component: 'video_hero' });
    // Optional: stop video
    const $iframe = $('#demo-video');
    $iframe.attr('src', $iframe.attr('src'));
  }

  // CTA click
  $('#watch-demo').on('click', function(){
    track('hero_cta_click', { cta_id: 'watch_demo' });
    openModal();
  });

  // Close handlers
  $close.on('click', closeModal);
  $(document).on('keydown', function(e){
    if(e.key === 'Escape') closeModal();
  });
  $modal.on('click', function(e){
    if(e.target === this) closeModal();
  });

})(jQuery);
