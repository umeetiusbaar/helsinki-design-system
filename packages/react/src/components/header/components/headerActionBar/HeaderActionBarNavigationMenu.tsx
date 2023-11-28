import React, {
  cloneElement,
  isValidElement,
  MouseEventHandler,
  TransitionEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useHeaderContext, useSetHeaderContext } from '../../HeaderContext';
import classNames from '../../../../utils/classNames';
import styles from './HeaderActionBarNavigationMenu.module.scss';
import { getChildrenAsArray } from '../../../../utils/getChildren';
import { HeaderLink } from '../headerLink';
import { IconAngleLeft } from '../../../../icons';
import useIsomorphicLayoutEffect from '../../../../hooks/useIsomorphicLayoutEffect';
import getIsElementLoaded from '../../../../utils/getIsElementLoaded';
import { LinkProps } from '../../../../internal/LinkItem';
import HeaderActionBarLogo from './HeaderActionBarLogo';

type NavigationSectionType = {
  logo: React.ReactNode;
  universalLinks: React.ReactNode[];
} & React.ComponentPropsWithoutRef<'section'>;

const NavigationSection = ({ children, className, logo, universalLinks, ...rest }: NavigationSectionType) => {
  return (
    <section {...rest} className={classNames(styles.navSection, className)}>
      <nav className={styles.navigation}>
        <ul className={styles.menu}>{children}</ul>
      </nav>
      <div className={styles.mobileMenuBottom}>
        {universalLinks && (
          <ul className={styles.universalList}>
            {universalLinks.map((child, index) => {
              if (!isValidElement(child)) return null;
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={index}>
                  {cloneElement(child as React.ReactElement, {
                    className: styles.universalLink,
                  })}
                </li>
              );
            })}
          </ul>
        )}
        {logo}
      </div>
    </section>
  );
};

type PreviousDropdownLinkProps = {
  link: React.ReactElement;
  frontPageLabel: string;
  titleHref?: string;
  openFrontPageLinksAriaLabel?: string;
  onClick?: (link?: React.ReactElement | string) => void;
};
const PreviousDropdownLink = ({
  link,
  frontPageLabel,
  onClick,
  titleHref,
  openFrontPageLinksAriaLabel,
}: PreviousDropdownLinkProps) => {
  // When the link is not an object with props, this should point to front page.
  const previousLabel = link?.props.label || frontPageLabel;
  const previousAriaLabel = link?.props.openDropdownAriaButtonLabel || openFrontPageLinksAriaLabel;
  return (
    <li className={styles.previousListItem}>
      <button
        type="button"
        className={styles.previousLinkWrapper}
        onClick={() => onClick(link || titleHref)}
        aria-label={previousAriaLabel}
      >
        <span className={styles.previousButton}>
          <IconAngleLeft className={styles.backIcon} />
        </span>
        <span className={styles.previousMobileLink}>{previousLabel}</span>
      </button>
    </li>
  );
};

type ActiveDropdownLinkProps = {
  link: React.ReactElement;
  frontPageLabel: string;
  titleHref?: string;
  id?: string;
  onLinkClick?: MouseEventHandler<HTMLAnchorElement>;
};
const ActiveDropdownLink = ({ id, link, frontPageLabel, titleHref, onLinkClick }: ActiveDropdownLinkProps) => {
  const className = styles.activeMobileLink;
  const activeLink = link ? (
    cloneElement(link, {
      id,
      className,
      dropdownButtonClassName: styles.hideDropdownButton,
      wrapperClassName: styles.mobileLinkWrapper,
      onClick: (event) => {
        if (link.props.onClick) link.props.onClick(event);
        onLinkClick(event);
      },
    })
  ) : (
    <HeaderLink id={id} label={frontPageLabel} href={titleHref} className={className} onClick={onLinkClick} />
  );
  return (
    <li className={styles.activeListItem}>
      <span className={styles.activeLinkWrapper}>{activeLink}</span>
    </li>
  );
};

type MenuLinksProps = {
  links: React.ReactNode[];
  onDropdownButtonClick: (link) => void;
  onLinkClick: (link) => void;
};
const MenuLinks = ({ links, onDropdownButtonClick, onLinkClick }: MenuLinksProps) => {
  return (
    <>
      {links
        .filter((child) => isValidElement(child))
        .map((child: React.ReactElement, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={index}>
            <span className={styles.mobileNavigationLink}>
              {cloneElement(child as React.ReactElement, {
                dropdownLinkClassName: styles.mobileDropdownLink,
                dropdownClassName: styles.mobileLinkDropdown,
                wrapperClassName: styles.mobileLinkWrapper,
                dropdownButtonClassName: styles.mobileLinkDropdownButton,
                className: classNames(child.props.className, styles.mobileLink),
                index,
                onDropdownButtonClick: () => onDropdownButtonClick(child),
                onClick: (event) => {
                  if (child.props.onClick) child.props.onClick(event);
                  onLinkClick(child);
                },
              })}
            </span>
          </li>
        ))}
    </>
  );
};

const Logo = ({ logo, logoProps }) => (
  <HeaderActionBarLogo
    logoProps={{
      ...logoProps,
      className: classNames(logoProps.className, styles.logoLink),
    }}
    logo={logo}
  />
);

/**
 * Find only the active links in the given objects model.
 * @param obj
 * @returns
 */
function findActiveLinks(obj) {
  const activeLinks = [];

  if (obj.props.active) {
    activeLinks.push(obj);
  }

  if (obj.props.dropdownLinks && obj.props.dropdownLinks.length > 0) {
    obj.props.dropdownLinks.forEach((link) => {
      activeLinks.push(...findActiveLinks(link));
    });
  }

  return activeLinks;
}

function getActiveMainLevelLink(links) {
  return getChildrenAsArray(links).find((link) => {
    return isValidElement(link) && link.props.active;
  });
}

// These are used as clasNames as well
type Position = 'left0' | 'left100' | 'left200';
type HeaderActionBarNavigationMenuProps = {
  frontPageLabel: string;
  titleHref: string;
  /**
   * Logo to use
   */
  logo: JSX.Element;
  /**
   * Logo properties
   */
  logoProps: LinkProps;
  openFrontPageLinksAriaLabel?: string;
};
export const HeaderActionBarNavigationMenu = ({
  frontPageLabel,
  titleHref,
  logo,
  logoProps,
  openFrontPageLinksAriaLabel,
}: HeaderActionBarNavigationMenuProps) => {
  const { navigationContent, mobileMenuOpen, hasUniversalContent, universalContent } = useHeaderContext();
  const { setMobileMenuOpen } = useSetHeaderContext();
  // State for which link menu is open but not necessarily active. Needed for browsing the menu.
  const [openMainLinks, setOpenMainLinks] = useState<React.ReactElement[]>([]);
  // State for the link with dropdowns that the user is opening. Needed for rendering next menu and to show its data while animating.
  const [openingLink, setOpeningLink] = useState<React.ReactElement | string>(null);
  // State for the wide wrapping element's position. Value is also used as a class for animation.
  const [position, setPosition] = useState<Position>('left0');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const navContainerRef = useRef<HTMLDivElement>();
  const currentActiveLinkId = 'current-active-link';
  const isOpeningFrontPageLinks = typeof openingLink === 'string' && openingLink === titleHref;
  const isUserInDropdownTree = openMainLinks.length > 1;
  const currentlyActiveMainLink = openMainLinks[openMainLinks.length - 1];
  const previousDropdownLink = isUserInDropdownTree
    ? openMainLinks[openMainLinks.indexOf(currentlyActiveMainLink) - 1]
    : null;

  const menuLinks = openMainLinks.length > 0 ? currentlyActiveMainLink.props.dropdownLinks : navigationContent;
  const previousMenuLinks = isUserInDropdownTree
    ? openMainLinks[openMainLinks.indexOf(currentlyActiveMainLink) - 1].props.dropdownLinks
    : navigationContent;
  const universalLinks = hasUniversalContent ? getChildrenAsArray(universalContent) : [];
  const isRenderingDeepestMenu = position === 'left200';
  const isOpeningLinkFromBefore = (link: React.ReactElement | string) => {
    // When typeof string, it's the front page. That's handled elsewhere.
    if (typeof link === 'string') return false;
    return !!openMainLinks.includes(link);
  };

  useIsomorphicLayoutEffect(() => {
    // Set active main links with dropdowns if any
    const mainLevelActiveLink = getActiveMainLevelLink(navigationContent);
    if (mainLevelActiveLink) {
      const mainLinkElement = mainLevelActiveLink as React.ReactElement;
      const activeLinks = findActiveLinks(cloneElement(mainLinkElement));
      const activeMainLinks = activeLinks.filter((link) => link.props.dropdownLinks);
      const correctMenuPosition = {
        0: 'left0',
        1: 'left100',
        2: 'left200',
      };
      setOpenMainLinks(activeMainLinks);
      // In case there are active links set, set the menu position and focus order correctly
      setPosition(correctMenuPosition[activeMainLinks.length]);
    }
  }, [navigationContent]);

  /* When opening link, start animation */
  useEffect(() => {
    if ((openingLink && isOpeningLinkFromBefore(openingLink)) || openingLink === titleHref) {
      // Going backwards in the navigation tree
      if (position === 'left100') setPosition('left0');
      else if (position === 'left200') setPosition('left100');
    } else if (openingLink && !isOpeningLinkFromBefore(openingLink)) {
      // Going forward in the navigation tree
      if (position === 'left0') setPosition('left100');
      else if (position === 'left100') setPosition('left200');
    }
  }, [openingLink]);

  useEffect(() => {
    if (mobileMenuOpen && navContainerRef?.current) {
      // Set the height of the menu container
      const renderedChildIndex = Math.abs(navContainerRef.current.getBoundingClientRect().left / window.innerWidth);
      const currentTargetHeight = navContainerRef.current.children[renderedChildIndex].clientHeight;
      navContainerRef.current.style.height = `${currentTargetHeight}px`;
    }
  }, [mobileMenuOpen]);

  const goDeeper = (link: React.ReactElement) => {
    setOpeningLink(link);
    setIsAnimating(true);
  };

  const goBack = (link: React.ReactElement | string) => {
    setOpeningLink(link);
    setIsAnimating(true);
  };

  const menuSectionsAnimationDone = async (e: TransitionEvent) => {
    const targetElement = e.target as HTMLElement;
    // If user was opening a dropdown, set the active open link
    if (openingLink && !isOpeningFrontPageLinks) {
      let newLinks = [];
      const newlyOpenedLink = openingLink;
      // Going backwards
      if (isOpeningLinkFromBefore(openingLink)) newLinks = openMainLinks.slice(0, -1);
      // Going deeper
      else newLinks = [...openMainLinks, newlyOpenedLink];
      setOpenMainLinks(newLinks);
      setOpeningLink(null);
    } else if (isOpeningFrontPageLinks) {
      // Opening front page links, reset state links
      setOpenMainLinks([]);
      setOpeningLink(null);
    }
    setIsAnimating(false);

    // If the animation was related to moving menus, set the focus to the currently active page link
    if (e.propertyName === 'transform' && targetElement.firstChild.nodeName === 'SECTION') {
      // Set the focus to the currently active page link
      const linkElement = await getIsElementLoaded(`#${currentActiveLinkId}`);
      linkElement.focus();

      // Set the height of the menu container
      const renderedChildIndex = Math.abs(navContainerRef.current.getBoundingClientRect().left / window.innerWidth);
      const currentTargetHeight = targetElement.children[renderedChildIndex].clientHeight;
      navContainerRef.current.style.height = `${currentTargetHeight}px`;
    }
  };

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  const RenderNavigationSection = ({
    links,
    activeLink,
    activeLinkId,
    ariaHidden,
    previousLink,
    showPreviousLink,
    className,
  }: {
    links: React.ReactNode[];
    activeLink: React.ReactElement;
    activeLinkId?: string;
    previousLink?: React.ReactElement;
    showPreviousLink?: boolean;
    ariaHidden: boolean;
    className: string;
  }) => {
    // PreviousDropdownLink defaults to titleHref if link is undefined
    return (
      <NavigationSection
        universalLinks={universalLinks}
        aria-hidden={ariaHidden}
        className={className}
        logo={<Logo logo={logo} logoProps={{ ...logoProps }} />}
      >
        {showPreviousLink && (
          <PreviousDropdownLink
            link={previousLink}
            frontPageLabel={frontPageLabel}
            titleHref={titleHref}
            onClick={goBack}
            openFrontPageLinksAriaLabel={openFrontPageLinksAriaLabel}
          />
        )}
        <ActiveDropdownLink
          id={activeLinkId}
          link={activeLink}
          frontPageLabel={frontPageLabel}
          titleHref={titleHref}
          onLinkClick={handleLinkClick}
        />
        <MenuLinks links={links} onDropdownButtonClick={goDeeper} onLinkClick={handleLinkClick} />
      </NavigationSection>
    );
  };

  return (
    <div className={classNames(styles.headerNavigationMenu, mobileMenuOpen && styles.mobileMenuOpen)}>
      <div
        className={classNames(styles.navigationWrapper, styles[position])}
        onTransitionEnd={menuSectionsAnimationDone}
        ref={navContainerRef}
      >
        {/* Previous menu links */}
        {openMainLinks.length >= 1 && (
          <RenderNavigationSection
            activeLink={previousDropdownLink}
            ariaHidden
            className={isAnimating ? styles.visible : styles.hidden}
            links={previousMenuLinks}
            showPreviousLink={false}
          />
        )}

        {/* Currently open links */}
        <RenderNavigationSection
          activeLink={!isRenderingDeepestMenu ? currentlyActiveMainLink : previousDropdownLink}
          activeLinkId={!isRenderingDeepestMenu && !isAnimating ? currentActiveLinkId : undefined}
          ariaHidden={isRenderingDeepestMenu}
          className={!isRenderingDeepestMenu ? styles.visible : styles.hidden}
          links={menuLinks}
          previousLink={openMainLinks.length > 0 ? previousDropdownLink : undefined}
          showPreviousLink={openMainLinks.length > 0}
        />

        {/* Next links. Rendered at the deepest level. */}
        {!openingLink && (
          <RenderNavigationSection
            activeLink={currentlyActiveMainLink}
            activeLinkId={isRenderingDeepestMenu ? currentActiveLinkId : undefined}
            ariaHidden={!isRenderingDeepestMenu}
            className={isAnimating || isRenderingDeepestMenu ? styles.visible : styles.hidden}
            links={menuLinks}
            previousLink={previousDropdownLink}
            showPreviousLink
          />
        )}

        {/* Render the menu animating into view for better UX. */}
        {openingLink && typeof openingLink !== 'string' && (
          <RenderNavigationSection
            activeLink={openingLink}
            ariaHidden={!openingLink}
            className={isAnimating ? styles.visible : styles.hidden}
            links={openingLink.props.dropdownLinks}
            previousLink={currentlyActiveMainLink}
            showPreviousLink
          />
        )}
      </div>
    </div>
  );
};
