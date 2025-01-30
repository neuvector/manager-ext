import { nextTick } from 'vue';

export default {
  mounted(el, binding) {
    console.log('binding.arg', binding.value, el);

    const scrollHandler = () => {
      console.log('scrolling...');
      let a = el.scrollTop;
      let b = el.scrollHeight - el.clientHeight;
      let percentOfScroll = a / b;

      if (percentOfScroll > 0.9) {
        if (binding.value.array.length - binding.value.begin > binding.value.limit) {
          binding.value.begin += 9;
          binding.value.page++;
          console.log('page: ', binding.value.page);
          nextTick(() => {
            el.scrollTop -= 650;
          });
          closeDetails();
        }
      } else if (percentOfScroll < 0.2 && percentOfScroll > 0) {
        if (binding.value.begin !== 0) {
          binding.value.begin -= 9;
          binding.value.page--;
          console.log('page: ', binding.value.page);
          nextTick(() => {
            el.scrollTop += 650;
          });
          closeDetails();
        }
      } else if (percentOfScroll === 0) {
        binding.value.begin = 0;
      }

      let targetIndex = binding.value.openedIndex - 9 * (binding.value.page - binding.value.openedPage);
      if (targetIndex < 30 && targetIndex >= 0) {
        let targetElement = document.getElementById(`sec-${targetIndex}`);
        if (targetElement) {
          targetElement.checked = true;
        }
      }
    };

    const closeDetails = () => {
      document.getElementsByName('secEvt').forEach((elem) => {
        elem.checked = false;
      });
    };

    el.__scrollHandler__ = scrollHandler; // Store handler for cleanup
    el.addEventListener('scroll', scrollHandler);
  },

  unmounted(el) {
    el.removeEventListener('scroll', el.__scrollHandler__);
    delete el.__scrollHandler__;
  }
};